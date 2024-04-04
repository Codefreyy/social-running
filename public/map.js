export const MY_MAPBOXGL_TOKEN =
  "pk.eyJ1Ijoiam95eXl5eXl5IiwiYSI6ImNsdHZ3NjAyNzE4MmoycXFwdzVwYXpvNGwifQ.rLajkAaYDentEmhdczyRyw"
export let map = null
export let markers = {}
export let mapRoute = null
export let routeLayerID = "route" // Unique ID for the route layer
export let startPointMarker
export let endPointMarker
let meetingPointIndex = 0

export function initializeMap() {
  mapboxgl.accessToken = MY_MAPBOXGL_TOKEN
  map = new mapboxgl.Map({
    container: "start-map", // Container ID
    style: "mapbox://styles/mapbox/streets-v11", // Style URL
    center: [-2.79902, 56.33871], // Starting position [lng, lat]
    zoom: 9, // Starting zoom level
  })

  map.addControl(new mapboxgl.NavigationControl()) // Add zoom and rotation controls to the map.
}

export function showRoute() {
  console.log("showRoute start, markers:", markers)
  if (!markers["start"] || !markers["end"]) return

  const startLngLat = markers["start"].getLngLat()
  const endLngLat = markers["end"].getLngLat()

  let waypoints = []

  const meetingPointKeys = Object.keys(markers)
    .filter((key) => key.includes("meetingPoint"))
    .sort(
      (a, b) =>
        Number(a.replace("meetingPoint", "")) -
        Number(b.replace("meetingPoint", ""))
    )

  meetingPointKeys.forEach((key) => {
    const { lng, lat } = markers[key].getLngLat()
    if (lng != null && lat != null) {
      waypoints.push(`${lng},${lat}`)
    }
  })

  console.log({ waypoints })

  const waypointsString = waypoints.join(";")

  const directionsQuery = `https://api.mapbox.com/directions/v5/mapbox/walking/${
    startLngLat.lng
  },${startLngLat.lat}${waypointsString ? ";" : ""}${waypointsString};${
    endLngLat.lng
  },${endLngLat.lat}?geometries=geojson&access_token=${MY_MAPBOXGL_TOKEN}`

  fetch(directionsQuery)
    .then((response) => response.json())
    .then((data) => {
      console.log({ data })
      const route = data.routes[0].geometry
      updateRouteOnMap(route)
    })

  console.log("showRoute start, markers:", markers)
}

export function showDetailRunRoute(start, end, meetingPoints) {
  const detailsMap = new mapboxgl.Map({
    container: "run-details-map",
    style: "mapbox://styles/mapbox/streets-v11",
    center: [start[0], start[1]],
    zoom: 12,
  })

  detailsMap.on("load", () => {
    // Add start and end markers
    new mapboxgl.Marker({ color: "green" }).setLngLat(start).addTo(detailsMap)
    new mapboxgl.Marker({ color: "red" }).setLngLat(end).addTo(detailsMap)

    // For each meeting point, create and add a marker to the map
    console.log({ meetingPoints }, 123123)
    meetingPoints.forEach((mp) => {
      // Parse the coordinates to float, since they are provided as strings
      const coordinates = mp.coordinates.map((coord) => parseFloat(coord))
      // Add a marker for each meeting point using its coordinates
      new mapboxgl.Marker({ color: "blue" })
        .setLngLat([coordinates[0], coordinates[1]]) // Note the order might need to be reversed depending on your coordinate system
        .addTo(detailsMap)
    })

    // Prepare waypoints string from meeting points for the directions query
    const waypoints = meetingPoints.map((mp) => mp.coordinates).join(";")

    const directionsQuery = `https://api.mapbox.com/directions/v5/mapbox/walking/${start[0]},${start[1]};${waypoints};${end[0]},${end[1]}?geometries=geojson&access_token=${MY_MAPBOXGL_TOKEN}`

    fetch(directionsQuery)
      .then((response) => response.json())
      .then((data) => {
        const route = data.routes[0].geometry
        detailsMap.addSource("route", {
          type: "geojson",
          data: {
            type: "Feature",
            properties: {},
            geometry: route,
          },
        })

        detailsMap.addLayer({
          id: "route",
          type: "line",
          source: "route",
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": "#888",
            "line-width": 6,
          },
        })
      })
  })
}

export function addOrUpdateMarker(lngLat, type) {
  // Remove the existing marker if it exists
  if (markers[type]) {
    markers[type].remove()
    delete markers[type]
  }

  // Create and add the new marker
  markers[type] = new mapboxgl.Marker({
    color: type === "start" ? "green" : type === "end" ? "red" : "blue",
  })
    .setLngLat(lngLat)
    .addTo(map)

  map.flyTo({ center: lngLat, zoom: 10 }) // Center the map on the new marker
}

export function updateRouteOnMap(route) {
  if (map.getSource(routeLayerID)) {
    map.removeLayer(routeLayerID)
    map.removeSource(routeLayerID)
  }
  // Add the new route to the map
  map.addSource(routeLayerID, {
    type: "geojson",
    data: {
      type: "Feature",
      properties: {},
      geometry: route,
    },
  })

  map.addLayer({
    id: routeLayerID,
    type: "line",
    source: routeLayerID,
    layout: { "line-join": "round", "line-cap": "round" },
    paint: { "line-color": "#888", "line-width": 8 },
  })
}

const selectMeetingPoint = (searchInput, lngLat, uniqueKey, placeName) => {
  searchInput.value = placeName
  searchInput.dataset.lng = lngLat[0]
  searchInput.dataset.lat = lngLat[1]

  // Ensure markers are updated or added to the map
  addOrUpdateMarker(lngLat, uniqueKey)
}

export function handleAddMeetingPoint() {
  const container = document.getElementById("meeting-points-container")
  const inputGroup = document.createElement("div")
  inputGroup.className = "meeting-point-input-groups"
  const uniqueKey = `meetingPoint${++meetingPointIndex}` // Unique key for the meeting point
  inputGroup.innerHTML = `
  <div class="meeting-point-input-group">
  <input type="text" placeholder="Enter meeting point" class="meeting-point-search"  data-key="${uniqueKey}" required/>
  <button type="button" class="remove-meeting-point sm-button" data-key="${uniqueKey}" >Remove</button>
  </div>
  <div class="meeting-point-suggestions">
  </div>
`
  container.appendChild(inputGroup)

  const searchInput = inputGroup.querySelector(".meeting-point-search")
  const suggestionsBox = inputGroup.querySelector(".meeting-point-suggestions")

  searchInput.addEventListener("input", async (e) => {
    const searchText = e.target.value
    if (searchText.length < 3) return // Wait for at least 3 characters

    if (markers[uniqueKey]) {
      markers[uniqueKey].remove()
      delete markers[uniqueKey]
    }

    const suggestions = await fetchMeetingPointSuggestions(searchText)
    suggestionsBox.innerHTML = "" // Clear existing suggestions
    suggestionsBox.style.display = "block"
    suggestions.forEach((place) => {
      const option = document.createElement("div")
      option.className = "suggestion"
      option.textContent = place.place_name
      option.addEventListener("click", () => {
        searchInput.value = place.place_name

        // Optionally store coordinates in a hidden input for form submission
        suggestionsBox.innerHTML = "" // Clear suggestions after selection
        suggestionsBox.style.display = "none"

        const lngLat = place.center
        const marker = new mapboxgl.Marker({ color: "blue" })
          .setLngLat(lngLat)
          .addTo(map)

        markers[uniqueKey] = marker

        console.log({ uniqueKey })
        selectMeetingPoint(
          searchInput,
          place.center,
          uniqueKey,
          place.place_name
        )
        showRoute()
        map.flyTo({ center: lngLat, zoom: 10 })
      })
      suggestionsBox.appendChild(option)
    })
  })

  inputGroup
    .querySelector(".remove-meeting-point")
    .addEventListener("click", function () {
      const key = this.getAttribute("data-key")
      if (markers[key]) {
        console.log("Removing marker:", markers)
        markers[key].remove() // Remove the marker from the map
        delete markers[key] // Remove the marker from the markers object
        console.log("Removing marker: seccuess", markers)

        showRoute()
      }
      inputGroup.remove()
    })
}

async function fetchMeetingPointSuggestions(searchText) {
  const response = await fetch(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
      searchText
    )}.json?access_token=${MY_MAPBOXGL_TOKEN}`
  )
  const data = await response.json()
  return data.features // Assuming features contain the suggestions
}

export const handleEndPointSearch = async (e) => {
  const searchText = e.target.value
  if (searchText.length < 3) return // Wait for at least 3 characters before searching

  const response = await fetch(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
      searchText
    )}.json?access_token=${MY_MAPBOXGL_TOKEN}`
  )
  const data = await response.json()
  const suggestions = data.features

  const suggestionsList = document.getElementById("end-point-suggestions")
  suggestionsList.innerHTML = "" // Clear existing suggestions
  suggestionsList.style.display = "block"
  suggestions.forEach((place) => {
    const option = document.createElement("div")
    option.className = "suggestion"
    option.textContent = place.place_name
    option.onclick = function () {
      document.getElementById("end-point-search").value = place.place_name
      document.getElementById("end-point").value = place.center.join(",")
      suggestionsList.innerHTML = "" // Clear suggestions after selection
      suggestionsList.style.display = "none"

      addOrUpdateMarker(place.center, "end")

      // Check if both start and end markers are set and show the route
      if (markers["start"] && markers["end"]) {
        showRoute()
      }
    }
    suggestionsList.appendChild(option)
  })
}

export const handleStartPointSearch = async (e) => {
  const searchText = e.target.value
  if (searchText.length < 3) return // Wait for at least 3 characters before searching

  const response = await fetch(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
      searchText
    )}.json?access_token=${MY_MAPBOXGL_TOKEN}`
  )
  const data = await response.json()
  const suggestions = data.features

  const suggestionsList = document.getElementById("start-point-suggestions")
  suggestionsList.style.display = "block"
  suggestionsList.innerHTML = "" // Clear existing suggestions
  suggestions.forEach((place) => {
    const option = document.createElement("div")
    option.className = "suggestion"
    option.textContent = place.place_name
    option.onclick = function () {
      document.getElementById("start-point-search").value = place.place_name
      document.getElementById("start-point").value = place.center.join(",")
      suggestionsList.innerHTML = "" // Clear suggestions after selection
      suggestionsList.style.display = "none"

      addOrUpdateMarker(place.center, "start")
      if (markers["start"] && markers["end"]) {
        showRoute()
      }
    }
    suggestionsList.appendChild(option)
  })
}
