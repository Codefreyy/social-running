const MY_MAPBOXGL_TOKEN =
  "pk.eyJ1Ijoiam95eXl5eXl5IiwiYSI6ImNsdHZ3NjAyNzE4MmoycXFwdzVwYXpvNGwifQ.rLajkAaYDentEmhdczyRyw"
let startMap = null
let mapRoute = null
let startPointMarker
let endPointMarker

document.addEventListener("DOMContentLoaded", () => {
  initializeMapboxMaps()
  toggleSections(true) //ensure that when page loads, only show the auth form

  document
    .getElementById("create-run")
    .addEventListener("submit", onCreateRunFormSubmit)

  document.getElementById("btn-back-to-list").addEventListener("click", () => {
    document.getElementById("run-details").style.display = "none"
    document.getElementById("run-list-section").style.display = "block"
    document.getElementById("create-run").style.display = "block"
  })

  window.viewRunDetails = async (runId) => {
    // hide other sections
    document.getElementById("create-run").style.display = "none"
    document.getElementById("run-list-section").style.display = "none"

    // fetching run details from the server
    const response = await fetch(`/runs/${runId}`)
    const runDetails = await response.json()

    // constructing details section content
    const detailsSection = document.getElementById("run-details-content")
    detailsSection.innerHTML = `
    <div class="run-details-card">
        <h2>${runDetails.name}</h2>
        <p>Description: ${runDetails.description}</p>
        <p>Start Time: ${new Date(runDetails.startTime).toLocaleString()}</p>
        <p>Start Point: ${
          runDetails.startPointName || runDetails.startPoint
        }</p> 
        <p>End Point: ${runDetails.endPointName || runDetails.endPoint}</p> 
        <p>Expected Pace: ${runDetails.expectedPace} minute miles</p>
    </div>
`
    document.getElementById("run-details").style.display = "block"

    // coordinates of start point and end point
    const startPointCoords = runDetails.startPoint.split(",").map(Number)
    const endPointCoords = runDetails.endPoint.split(",").map(Number)

    showDetailRunRoute(startPointCoords, endPointCoords)
  }

  login_btn = document.getElementById("log-in")
  login_btn.addEventListener("click", login)

  // map search

  const startPointSearch = document.getElementById("start-point-search")
  startPointSearch.addEventListener("input", async (e) => {
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

        // Update the map with the new marker
        if (startPointMarker) startPointMarker.remove() // Remove existing marker
        startPointMarker = new mapboxgl.Marker({ color: "green" })
          .setLngLat(place.center)
          .addTo(startMap) // Assuming startMap is your map instance
        startMap.flyTo({ center: place.center, zoom: 10 })
        showRoute()
      }
      suggestionsList.appendChild(option)
    })
  })

  const endPointSearch = document.getElementById("end-point-search")
  endPointSearch.addEventListener("input", async (e) => {
    console.log("...")
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

        // Update the map with the new marker
        if (endPointMarker) endPointMarker.remove() // Remove existing marker
        endPointMarker = new mapboxgl.Marker({ color: "red" })
          .setLngLat(place.center)
          .addTo(startMap)
        startMap.flyTo({ center: place.center, zoom: 10 })
        showRoute()
      }
      suggestionsList.appendChild(option)
    })
  })
})

function showRoute() {
  const start = startPointMarker.getLngLat()
  const end = endPointMarker.getLngLat()
  if (!start || !end) return

  // using Mapbox Directions API query routes
  const directionsQuery = `https://api.mapbox.com/directions/v5/mapbox/driving/${start.lng},${start.lat};${end.lng},${end.lat}?geometries=geojson&access_token=${MY_MAPBOXGL_TOKEN}`

  fetch(directionsQuery)
    .then((response) => response.json())
    .then((data) => {
      const route = data.routes[0].geometry

      // remove already existing route
      if (mapRoute) {
        startMap.removeLayer("route")
        startMap.removeSource("route")
      }

      // add new routes to the map
      startMap.addSource("route", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: route,
        },
      })

      startMap.addLayer({
        id: "route",
        type: "line",
        source: "route",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "#888",
          "line-width": 8,
        },
      })

      mapRoute = true // mark route added
    })
}

async function onCreateRunFormSubmit(e) {
  e.preventDefault()
  const startTime = document.getElementById("start-time").value
  const startPoint = document.getElementById("start-point").value
  const endPoint = document.getElementById("end-point").value
  const startPointName = document.getElementById("start-point-search").value // 获取地点的名称
  const endPointName = document.getElementById("end-point-search").value //
  const expectedPace = document.getElementById("expected-pace").value
  const level = document.getElementById("level").value

  const name = document.getElementById("name").value
  const description = document.getElementById("description").value

  const runData = {
    startTime,
    startPoint,
    startPointName,
    endPointName,
    endPoint,
    expectedPace,
    name,
    level,
    description,
  }

  const response = await fetch("/runs", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(runData),
  })

  const result = await response.json()
  console.log(result)
  loadRuns() // Refresh the list after adding
}

function initializeMapboxMaps() {
  mapboxgl.accessToken = MY_MAPBOXGL_TOKEN

  startMap = new mapboxgl.Map({
    container: "start-map",
    style: "mapbox://styles/mapbox/streets-v11",
    center: [-2.79902, 56.33871],

    zoom: 9,
  })

  // Add map controls for user interaction
  startMap.addControl(new mapboxgl.NavigationControl())

  // Event listeners for map clicks to set the start and end points
  startMap.on("click", function (e) {
    const coords = [e.lngLat.lng, e.lngLat.lat]
    document.getElementById("start-point").value = coords.join(",")
  })
}

const loadRuns = async () => {
  const response = await fetch("/runs")
  const runs = await response.json()

  const listElement = document.getElementById("run-list")
  listElement.innerHTML = "" // Clear the list before adding new elements
  listElement.className = "runs-grid" // Assign a class for styling the grid

  runs.forEach((run) => {
    const now = new Date()
    const startTime = new Date(run.startTime)
    let statusBadgeClass = "status-Upcoming"
    let status = "Upcoming" // Default status
    if (now > startTime) {
      status = "Expired" // If the current time is past the start time
      statusClass = "status-Expired"
    }

    const levelBadgeClass = `level-${run.level?.toLowerCase()}`

    const item = document.createElement("div")
    item.className = "run-item" // Add a class for styling
    item.innerHTML = `
    <h3>${run.name}
    <span class="badge ${levelBadgeClass}">${run.level}</span>
    <span class="badge ${statusBadgeClass}">${status}</span>
    </h3>
    <p>Start Time: ${startTime.toLocaleString()}</p>
    <p>Start Point: ${run.startPointName}</p>
    <p>End Point: ${run.endPointName}</p>
    <p>Expected Pace: ${run.expectedPace}</p>
    <button onclick="viewRunDetails('${run._id}')">See Detail</button>
`
    listElement.appendChild(item)
  })
}

function parseResponse(response) {
  return response.json()
}

function login() {
  username = document.getElementById("username")
  password = document.getElementById("password")
  user_key = btoa(username.value + ":" + password.value)
  username.value = ""
  password.value = ""
  // Send login credentials to the server
  fetch("/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Basic " + user_key,
    },
  })
    .then(parseResponse)
    .then((data) => {
      loadRuns()
      toggleSections(false) // login successfully, so hide auth form, show other sections
    })
    .catch((error) => {
      console.error("Login failed:", error)
      alert(`Logged in failed!`)
    })
}

const logout_btn = document.getElementById("logout")
logout_btn.addEventListener("click", logout)

function logout() {
  fetch("/logout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data)
      // show auth form, hide other sections
      toggleSections(true)
    })
    .catch((error) => {
      console.error("Logout failed:", error)
    })
}

function toggleSections(showLogin) {
  document.getElementById("auth").style.display = showLogin ? "block" : "none"
  document.getElementById("logout").style.display = showLogin ? "none" : "block"
  document.getElementById("create-run").style.display = showLogin
    ? "none"
    : "block"
  document.getElementById("run-list-section").style.display = showLogin
    ? "none"
    : "block"

  document.getElementById("run-details").style.display = "none"
}

function showDetailRunRoute(start, end) {
  const detailsMap = new mapboxgl.Map({
    container: "run-details-map",
    style: "mapbox://styles/mapbox/streets-v11",
    center: [start[0], start[1]],
    zoom: 12,
  })

  detailsMap.on("load", () => {
    new mapboxgl.Marker({ color: "green" }).setLngLat(start).addTo(detailsMap)
    new mapboxgl.Marker({ color: "red" }).setLngLat(end).addTo(detailsMap)

    const directionsQuery = `https://api.mapbox.com/directions/v5/mapbox/walking/${start[0]},${start[1]};${end[0]},${end[1]}?geometries=geojson&access_token=${MY_MAPBOXGL_TOKEN}`

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
