export const MY_MAPBOXGL_TOKEN =
  "pk.eyJ1Ijoiam95eXl5eXl5IiwiYSI6ImNsdHZ3NjAyNzE4MmoycXFwdzVwYXpvNGwifQ.rLajkAaYDentEmhdczyRyw"
export let map = null
export let markers = {}
export let mapRoute = null
export let routeLayerID = "route" // Unique ID for the route layer
export let startPointMarker
export let endPointMarker

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
    const startLngLat = markers["start"].getLngLat()
    const endLngLat = markers["end"].getLngLat()
  
    if (!startLngLat || !endLngLat) return
  
    // using Mapbox Directions API query routes
    const directionsQuery = `https://api.mapbox.com/directions/v5/mapbox/driving/${startLngLat.lng},${startLngLat.lat};${endLngLat.lng},${endLngLat.lat}?geometries=geojson&access_token=${MY_MAPBOXGL_TOKEN}`
  
    fetch(directionsQuery)
      .then((response) => response.json())
      .then((data) => {
        const route = data.routes[0].geometry
        updateRouteOnMap(route)
      })
  }
  
export function addOrUpdateMarker(lngLat, type) {
    // Remove the existing marker if it exists
    if (markers[type]) {
      markers[type].remove()
    }
  
    // Create and add the new marker
    markers[type] = new mapboxgl.Marker({
      color: type === "start" ? "green" : "red",
    }) // Use different colors for different types if you wish
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