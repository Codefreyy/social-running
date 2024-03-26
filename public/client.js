const MY_MAPBOXGL_TOKEN =
  "pk.eyJ1Ijoiam95eXl5eXl5IiwiYSI6ImNsdHZ3NjAyNzE4MmoycXFwdzVwYXpvNGwifQ.rLajkAaYDentEmhdczyRyw"
let startMap = null
let mapRoute = null
let startPointMarker
let endPointMarker
let currentRunId = null

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

    currentRunId = runId

    // fetching run details from the server
    const response = await fetch(`/runs/${runId}`)
    const runDetails = await response.json()

    // update join button
    const username = localStorage.getItem("username")
    const joinedRuns = await fetchJoinedRuns(username)
    const hasJoined = joinedRuns.includes(runId)

    // constructing details section content
    const detailsSection = document.getElementById("run-details-content")
    detailsSection.innerHTML = `
    <div class="run-details-card">
        <h2>${runDetails.name}</h2>
    <button id="joinRun" data-run-id="${runDetails._id}">${
      username ? "Join" : "Login to Join"
    }</button>
    <div>Participants: <span id="participantCount">0</span></div>
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
    const joinButton = document.getElementById("joinRun")
    joinButton.textContent = hasJoined ? "Joined" : "Join"
    joinButton.disabled = hasJoined

    // coordinates of start point and end point
    const startPointCoords = runDetails.startPoint.split(",").map(Number)
    const endPointCoords = runDetails.endPoint.split(",").map(Number)
    console.log("comments", runId)
    await showComments(runId)
    showDetailRunRoute(startPointCoords, endPointCoords)

    // bind eventListner to joinRun button
    document
      .getElementById("joinRun")
      .addEventListener("click", async function () {
        const runId = this.getAttribute("data-run-id")
        const username = localStorage.getItem("username")
        const response = await fetch(`/runs/${runId}/join`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username: username }),
        })
        if (response.ok) {
          // Refresh the participant count
          fetchParticipants(runId)
          this.textContent = "Joined"
          this.disabled = true
        }
      })

    // Call fetchParticipants initially to load the current participant count
    if (currentRunId) {
      fetchParticipants(currentRunId)
    }
  }

  async function fetchJoinedRuns(username) {
    if (!username) return []
    const response = await fetch(
      `/users/${encodeURIComponent(username)}/joinedRuns`
    )
    if (response.ok) {
      const { joinedRuns } = await response.json()
      return joinedRuns.map((run) => run._id) // We just need the IDs for comparison
    }
    return []
  }

  async function fetchParticipants(runId) {
    const response = await fetch(`/runs/${runId}/participants`)
    if (response.ok) {
      const data = await response.json()
      document.getElementById("participantCount").innerText =
        data.participantCount
    }
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
      localStorage.setItem("username", data.username)
      updateNavbar(data.username)
      loadRuns()
      toggleSections(false) // login successfully, so hide auth form, show other sections
    })
    .catch((error) => {
      console.error("Login failed:", error)
      alert(`Logged in failed!`)
    })
}

function updateNavbar(username) {
  const greeting = document.getElementById("user-greeting")
  if (username) {
    greeting.textContent = `Hi ${username}` // 显示问候语和用户名
  } else {
    greeting.textContent = "" // 清除问候语
  }
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

const logoutBtn = document.querySelector("#logout")
const authSection = document.getElementById("auth")

logoutBtn.addEventListener("click", () => {
  authSection.style.display = "block"
  logoutBtn.style.display = "none"

  toggleSections(true)
})

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

/** Comments Section */

const subBtn = document.getElementById("comSubmit")
const comContent = document.getElementById("comments")
const comInput = document.getElementById("comInput")
console.log({ comInput }, 122)
const commentsSec = document.getElementById("commentsSec")

async function showComments(runId) {
  const response = await fetch(`/comments?runId=${runId}`)
  const comments = await response.json()
  console.log("comments", comments)
  const commentsSec = document.getElementById("commentsSec")
  commentsSec.innerHTML = ""
  comments.forEach((comment) => {
    const comDetail = document.createElement("p")
    const date = new Date(comment.createdAt).toLocaleString()
    comDetail.textContent = `${comment.username}: ${comment.content} (${date})`
    commentsSec.appendChild(comDetail)
  })
  console.log(comments)
}
subBtn.addEventListener("click", async () => {
  const username = localStorage.getItem("username")
  console.log(username)
  const commentText = comInput.value
  if (commentText && currentRunId && username) {
    const response = await fetch("/comments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: commentText,
        runId: currentRunId,
        username,
      }),
    })
    if (response.ok) {
      comInput.value = ""
      showComments(currentRunId) // Re-fetch and display all comments
    }
  }
})


document.getElementById("find-run-btn").addEventListener("click",findRun);

async function findRun() {
  user_level = prompt("Enter level : ").toString();
  user_pace = parseInt(prompt("Enter average pace : "));
  console.log("level : "+user_level+"  pace : "+user_pace);

  const response = await fetch("/runs")
  const runs = await response.json()

  let maxCompatibilityScore = -1000;

  runs.forEach((run) => {
    let compatibilityScore = 0;

    // Check for level compatibility
    if (run.level === user_level) {
        compatibilityScore += 3;
    }
      
    //pace compatibility
    var pace_diff = Math.abs(user_pace - run.expectedPace);
    // Calculate the score based on the inverse proportionality
    compatibilityScore += 6 / (pace_diff + 1);
    console.log(compatibilityScore);
    // Update max compatibility score and recommended run ID if current run has higher score
    if (compatibilityScore > maxCompatibilityScore) {
      maxCompatibilityScore = compatibilityScore;
      recommendedRunId = run._id;
      recommendedRunName = run.name;
      console.log("new best run : "+recommendedRunName);

    }
  });
  alert("The best run to join for your profile is : " + recommendedRunName + "with a compatibility score of "+maxCompatibilityScore);
}
})