const MY_MAPBOXGL_TOKEN =
  "pk.eyJ1Ijoiam95eXl5eXl5IiwiYSI6ImNsdHZ3NjAyNzE4MmoycXFwdzVwYXpvNGwifQ.rLajkAaYDentEmhdczyRyw"
let map = null
let markers = {}
let mapRoute = null
let routeLayerID = "route" // Unique ID for the route layer
let startPointMarker
let endPointMarker
let currentRunId = null
let levelDistributionChart = null
const filterSelect = document.getElementById("filter-by-level")
const runList = document.getElementById("run-list")
const logoutBtn = document.querySelector("#logout")
const authSection = document.getElementById("auth")
const startPointSearch = document.getElementById("start-point-search")
const endPointSearch = document.getElementById("end-point-search")
const subBtn = document.getElementById("comSubmit")
const comContent = document.getElementById("comments")
const comInput = document.getElementById("comInput")
const commentsSec = document.getElementById("commentsSec")

document.addEventListener("DOMContentLoaded", () => {
  initializeMap()
  setupEventListeners()
  showAuthSection(true) //ensure that when page loads, only show the auth form
})

function setupEventListeners() {
  document
    .getElementById("add-meeting-point")
    .addEventListener("click", function () {
      const container = document.getElementById("meeting-points-container")
      const inputGroup = document.createElement("div")
      inputGroup.className = "meeting-point-input-groups"
      inputGroup.innerHTML = `
      <div class="meeting-point-input-group">
      <input type="text" placeholder="Enter meeting point" class="meeting-point-search" required/>
      <button type="button" class="remove-meeting-point sm-button">Remove</button>
      </div>
      <div class="meeting-point-suggestions">

    </div>
    `
      container.appendChild(inputGroup)

      const searchInput = inputGroup.querySelector(".meeting-point-search")
      const suggestionsBox = inputGroup.querySelector(
        ".meeting-point-suggestions"
      )

      searchInput.addEventListener("input", async (e) => {
        const searchText = e.target.value
        if (searchText.length < 3) return // Wait for at least 3 characters

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
          })
          suggestionsBox.appendChild(option)
        })
      })

      inputGroup
        .querySelector(".remove-meeting-point")
        .addEventListener("click", function () {
          inputGroup.remove()
        })
    })

  async function fetchMeetingPointSuggestions(searchText) {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
        searchText
      )}.json?access_token=${MY_MAPBOXGL_TOKEN}`
    )
    const data = await response.json()
    return data.features // Assuming features contain the suggestions
  }

  logoutBtn.addEventListener("click", async () => {
    const sessionId = sessionStorage.getItem("sessionId")
    const username = sessionStorage.getItem("username")
    try {
      const response = await fetch("/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sessionId, username }),
      })
      if (response.ok) {
        //Clear the sessionId stored by the client after successful logout
        sessionStorage.clear()
        // Update UI status
        updateNavbar(null)
        showAuthSection(true)
        authSection.style.display = "flex"
        logoutBtn.style.display = "none"
      } else {
        throw new Error("Logout failed")
      }
    } catch (error) {
      console.error("Logout error:", error)
      // 处理登出错误，可能需要告知用户重试
    }
  })

  filterSelect.addEventListener("change", (event) => {
    const selectedLevel = event.target.value
    displayRuns(selectedLevel)
  })

  document
    .getElementById("filter-by-pace")
    .addEventListener("change", function () {
      const selectedLevel = document.getElementById("filter-by-level").value
      const selectedPace = this.value
      displayRuns(selectedLevel, selectedPace)
    })

  document
    .getElementById("create-run")
    .addEventListener("submit", onCreateRunFormSubmit)

  document.getElementById("btn-back-to-list").addEventListener("click", () => {
    document.getElementById("run-details").style.display = "none"
    document.getElementById("run-list-section").style.display = "block"
    document.getElementById("create-run").style.display = "block"
  })

  document.getElementById("expected-pace").addEventListener("input", (e) => {
    console.log(e.target.value)

    const errorElemnt = document.getElementById("error-message")
    console.log({ errorElemnt })
    if (!e.target.checkValidity()) {
      console.log(e.target.checkValidity())
      errorElemnt.style.display = "block"
    } else {
      document.getElementById("error-message").style.display = "none"
    }
    const expectedPace = e.target.value
    console.log({ expectedPace })
  })

  window.viewRunDetails = showRunDetailPage

  subBtn.addEventListener("click", async () => {
    const username = sessionStorage.getItem("username")

    console.log(username)
    const commentText = comInput.value // Get the comment text entered by the user in the comment input box (comInput).
    // If the comment text, current run activity ID (currentRunId) and user name all exist, the internal code is executed.
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

  document.getElementById("find-run-btn").addEventListener("click", findRun)

  document.getElementById("sign-up").addEventListener("click", handleSignUp)

  login_btn = document.getElementById("log-in")
  login_btn.addEventListener("click", () => {
    const login_username = document.getElementById("username").value
    const login_password = document.getElementById("password").value
    login(login_username, login_password)
  })

  // map search
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

        addOrUpdateMarker(place.center, "start")
        if (markers["start"] && markers["end"]) {
          showRoute()
        }
      }
      suggestionsList.appendChild(option)
    })
  })

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

        addOrUpdateMarker(place.center, "end")

        // Check if both start and end markers are set and show the route
        if (markers["start"] && markers["end"]) {
          showRoute()
        }
      }
      suggestionsList.appendChild(option)
    })
  })
}

const showRunDetailPage = async (runId) => {
  // hide other sections
  document.getElementById("create-run").style.display = "none"
  document.getElementById("run-list-section").style.display = "none"
  document.getElementById("user-space-section").style.display = "none"
  currentRunId = runId

  // fetching run details from the server
  const response = await fetch(`/runs/${runId}`)
  const runDetails = await response.json()

  console.log({ runDetails })

  // update join button
  const username = sessionStorage.getItem("username")

  const joinedRuns = await fetchJoinedRuns(username)
  const hasJoined = joinedRuns.includes(runId)

  // constructing details section content
  const detailsSection = document.getElementById("run-details-content")
  const meetingPointsText = runDetails?.meetingPoints
    ? runDetails.meetingPoints.join(",")
    : "Not set"
  detailsSection.innerHTML = `
<div class="run-details-card">
   <div class="run-details-header"> 
    <h2>${runDetails.name}</h2>
   <div>
   <button id="joinRun" data-run-id="${runDetails._id}">${username ? "Click to Join" : "Login to Join"
    }</button>
  <div><span id="participantCount">0 </span>People Already Join!</div></div>
  </div>
    <p>${runDetails.description}</p>
    <p>Start Time: ${new Date(runDetails.startTime).toLocaleString()}</p>
    <p>Start Point: ${runDetails.startPointName || runDetails.startPoint}</p> 
    <p>End Point: ${runDetails.endPointName || runDetails.endPoint}</p> 
    <p>Meeting Points: ${meetingPointsText}</p>
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
  const startTime = runDetails.startTime;
  console.log("comments", runId)
  await Weather(runId, startPointCoords, startTime)
  await showComments(runId)
  showDetailRunRoute(startPointCoords, endPointCoords)

  // bind eventListner to joinRun button
  document
    .getElementById("joinRun")
    .addEventListener("click", async function () {
      const runId = this.getAttribute("data-run-id")
      const sessionId = sessionStorage.getItem("sessionId")
      const username = sessionStorage.getItem("username")
      const response = await fetch(`/runs/${runId}/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, sessionId }),
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

async function displayRuns(level = "all", pace = "all") {
  let query = `/runs?level=${level}`
  if (pace !== "all") {
    query += `&pace=${pace}`
  }

  try {
    const response = await fetch(query)
    if (!response.ok) {
      throw new Error(`Error fetching runs: ${response.statusText}`) // Handle non-200 responses
    }
    const runs = await response.json()
    runList.innerHTML = "" // Clear previous list items

    if (runs.length == 0) {
      runList.textContent = "Oops, no runs found."
      return
    }
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
      // Create and append a list item for each run
      const item = document.createElement("div")
      item.className = "run-item" // Add a class for styling
      item.innerHTML = `
        <h3>${run.name}
        </h3>
        <div>
        <span class="badge ${levelBadgeClass}">${run.level}</span>
        <span class="badge ${statusBadgeClass}">${status}</span></div>
        <p>Start Time: ${startTime.toLocaleString()}</p>
        <p>Start Point: ${run.startPointName}</p>
        <p>End Point: ${run.endPointName}</p>
        <p>Expected Pace: ${run.expectedPace}</p>
        <button onclick="viewRunDetails('${run._id}')">See Detail</button>
      `
      runList.appendChild(item)
    })
  } catch (error) {
    console.error("Error fetching runs:", error)
  }
}

async function fetchJoinedRuns(username) {
  const sessionId = sessionStorage.getItem("sessionId")
  if (!username) return []
  const response = await fetch(
    `/users/${encodeURIComponent(username)}/joinedRuns?sessionId=${sessionId}`
  )
  if (response.ok) {
    const { joinedRuns } = await response.json()
    console.log({ joinedRuns })
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

function showRoute() {
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

async function onCreateRunFormSubmit(e) {
  e.preventDefault()
  const startTime = document.getElementById("start-time").value
  const startTimeDate = new Date(startTime)
  const currentDateTime = new Date()
  const meetingPoints = [
    ...document.querySelectorAll(".meeting-point-search"),
  ].map((input) => input.value)
  console.log({ meetingPoints })
  startTimeDate.setSeconds(0)

  console.log(startTimeDate, currentDateTime, startTimeDate < currentDateTime)
  if (startTimeDate < currentDateTime) {
    alert("Start time cannot be earlier than current time")
    return
  }
  const startPoint = document.getElementById("start-point").value
  const endPoint = document.getElementById("end-point").value
  const startPointName = document.getElementById("start-point-search").value // 获取地点的名称
  const endPointName = document.getElementById("end-point-search").value //
  const expectedPace = document.getElementById("expected-pace").value
  const level = document.getElementById("level").value

  const name = document.getElementById("name").value
  const description = document.getElementById("description").value

  if (!startTime || !expectedPace || !level) {
    alert("Please fill in all the fields")
    return
  }

  if (!startPoint || !endPoint) {
    alert("Please input valid start point and end point!")
    return
  }

  if (!/^\d+(\.\d+)?$/.test(expectedPace)) {
    alert("Enter a valid number")
  }

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
    meetingPoints,
  }

  const response = await fetch("/runs", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(runData),
  })
  const result = await response.json()

  if (response.status == 200) {
    alert("Create Run Successfully!")
    loadRuns()
  } else {
    alert(`Create run faild: ${result?.error}`)
  }
  console.log("result", response)
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

function initializeMap() {
  mapboxgl.accessToken = MY_MAPBOXGL_TOKEN
  map = new mapboxgl.Map({
    container: "start-map", // Container ID
    style: "mapbox://styles/mapbox/streets-v11", // Style URL
    center: [-2.79902, 56.33871], // Starting position [lng, lat]
    zoom: 9, // Starting zoom level
  })

  map.addControl(new mapboxgl.NavigationControl()) // Add zoom and rotation controls to the map.
}

const loadRuns = async () => {
  const response = await fetch("/runs")
  const runs = await response.json()

  const listElement = document.getElementById("run-list")
  listElement.innerHTML = "" // Clear the list before adding new elements
  listElement.className = "runs-grid" // Assign a class for styling the grid

  runs.forEach((run) => {
    console.log({ run })
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
 
  </h3>
  <div>
  <span class="badge ${levelBadgeClass}">${run.level}</span>
  <span class="badge ${statusBadgeClass}">${status}</span></div>
  <p>Start Time: ${startTime.toLocaleString()}</p>
  <p>Start Point: ${run.startPointName}</p>
  <p>End Point: ${run.endPointName}</p>
  <p>Expected Pace: ${run.expectedPace}</p>
  <button onclick="viewRunDetails('${run._id}')">See Detail</button>
`
    listElement.appendChild(item)
  })
}

function login(username, password) {
  document.getElementById("username").value = ""
  document.getElementById("password").value = ""

  const sessionId = generateUUID()

  // Send login credentials to the server
  fetch("/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username,
      password,
      sessionId,
    }),
  })
    .then((response) => {
      console.log(response, response.ok)
      if (!response.ok) {
        throw new Error("Login failed")
      }
      return response.json()
    })
    .then((data) => {
      sessionStorage.setItem("sessionId", data.sessionId)
      sessionStorage.setItem("username", data.username)
      updateNavbar(data.username)
      loadRuns()
      showAuthSection(false) // login successfully, so hide auth form, show other sections
    })
    .catch((error) => {
      console.error("Login failed:", error)
      alert(`Logged in failed! Please check your credentials.`)
    })
}

function handleSignUp() {
  const username = document.getElementById("username").value.trim()
  const password = document.getElementById("password").value.trim()
  console.log("user", username, password)
  console.log(!username, !password)
  if (!username || !password) {
    alert("Please fill in all the fields")
    return
  }

  // 发送注册请求到服务器
  fetch("/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Registration successful", data)
      console.log(!data.success)
      if (!data.success) {
        alert(`Registration failed: ${data.message}`)
      } else {
        login(username, password)
        alert("Registration successful.")
      }
    })
    .catch((error) => {
      console.error("Registration failed:", error)
      alert("Registration failed")
    })
}

async function updateNavbar(username) {
  const greeting = document.getElementById("user-greeting")
  const userSpaceBtn = document.getElementById("user-space-btn")
  if (username) {
    greeting.textContent = `Hi ${username}`
    showUserSpaceButton(username)
  } else {
    if (userSpaceBtn) {
      userSpaceBtn.style.display = "none"
    }
    greeting.textContent = "" // 清除问候语
    debugger
  }
}

async function displayUserRuns(username) {
  const response = await fetch(`/users/${username}/joinedRuns`)
  const { joinedRuns } = await response.json()

  console.log({ joinedRuns })

  // clear current user joined run list
  const userRunsElement = document.getElementById("user-runs")
  userRunsElement.innerHTML = ""

  // calculate statistics
  let totalParticipations = joinedRuns.length
  let totalPace = 0
  let levelDistribution = { newbie: 0, intermediate: 0, expert: 0 }

  joinedRuns.forEach((run) => {
    totalPace += run.expectedPace
    levelDistribution[run.level]++
    const runElement = document.createElement("div")
    runElement.className = "run-item"
    runElement.innerHTML = `
          <h3>${run.name}</h3>
          <p>Start Time: ${new Date(run.startTime).toLocaleString()}</p>
          <p>Start Point: ${run.startPointName}</p>
          <p>End Point: ${run.endPointName}</p>
          <p>Expected Pace: ${run.expectedPace}</p>
          <p>Level: ${run.level}</p>
          <button onclick="viewRunDetails('${run._id}')">See Detail</button>
      `
    userRunsElement.appendChild(runElement)
  })

  let averagePace =
    totalParticipations > 0 ? totalPace / totalParticipations : 0

  document.getElementById(
    "total-participations"
  ).textContent = `Total Participations: ${totalParticipations}`
  document.getElementById(
    "average-pace"
  ).textContent = `Average Pace: ${averagePace.toFixed(2)} min/mile`

  //  Chart.js draw bar chart for level distribution
  if (levelDistributionChart) {
    levelDistributionChart.destroy()
  }
  const ctx = document
    .getElementById("level-distribution-chart")
    .getContext("2d")
  levelDistributionChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: Object.keys(levelDistribution),
      datasets: [
        {
          label: "Run Level Distribution",
          data: Object.values(levelDistribution),
          backgroundColor: [
            "rgba(255, 99, 132, 0.2)",
            "rgba(54, 162, 235, 0.2)",
            "rgba(255, 206, 86, 0.2)",
          ],
          borderColor: [
            "rgba(255,99,132,1)",
            "rgba(54, 162, 235, 1)",
            "rgba(255, 206, 86, 1)",
          ],
          borderWidth: 1,
        },
      ],
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  })
}

function showUserSpaceButton(username) {
  // check if button exists
  let userSpaceBtn = document.getElementById("user-space-btn")
  if (!userSpaceBtn) {
    // if not, create one
    userSpaceBtn = document.createElement("button")
    userSpaceBtn.id = "user-space-btn"
    document.querySelector(".navbar-logout").appendChild(userSpaceBtn)
  }

  userSpaceBtn.textContent = "User Space"
  userSpaceBtn.style.display = "block" // 确保按钮是可见的

  userSpaceBtn.onclick = null // remove previous one
  userSpaceBtn.addEventListener("click", async () => {
    document.getElementById("user-name").textContent = `Username: ${username}`

    document.getElementById("create-run").style.display = "block"
    document.getElementById("run-list-section").style.display = "block"
    document.getElementById("user-space-section").style.display = "none"
    toggleUserSpace(true)
    await displayUserRuns(username)

    document
      .getElementById("back-to-main")
      .addEventListener("click", function () {
        // 返回主页面
        toggleUserSpace(false)
      })
  })
}

function toggleUserSpace(showUserSpace) {
  if (showUserSpace) {
    document.getElementById("create-run").style.display = "none"
    document.getElementById("run-list-section").style.display = "none"
    document.getElementById("run-details").style.display = "none"
    document.getElementById("user-space-section").style.display = "flex"
  } else {
    document.getElementById("create-run").style.display = "block"
    document.getElementById("run-list-section").style.display = "block"
    document.getElementById("user-space-section").style.display = "none"
  }
}

function showAuthSection(showLogin) {
  document.getElementById("auth").style.display = showLogin ? "flex" : "none"
  document.getElementById("logout").style.display = showLogin ? "none" : "block"
  document.getElementById("create-run").style.display = showLogin
    ? "none"
    : "block"
  document.getElementById("run-list-section").style.display = showLogin
    ? "none"
    : "block"

  document.getElementById("run-details").style.display = "none"
  document.getElementById("user-space-section").style.display = "none"
  const userspaceBtn = document.getElementById("user-space-btn")
  if (userspaceBtn && showLogin) {
    userspaceBtn.style.display = "none"
  }
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

/** Comments Section */

// async function showComments(runId) {
//   const response = await fetch(`/comments?runId=${runId}`)
//   const comments = await response.json()
//   console.log("comments", comments)
//   const commentsSec = document.getElementById("commentsSec")
//   commentsSec.innerHTML = ""
//   comments.forEach((comment) => {
//     const comDetail = document.createElement("p")
//     // Convert the creation time of each comment to local time format
//     const date = new Date(comment.createdAt).toLocaleString()
//     comDetail.textContent = `${comment.username}: ${comment.content} (${date})`
//     commentsSec.appendChild(comDetail)
//   })
//   console.log(comments)
// }
async function showComments(runId) {
  const response = await fetch(`/comments?runId=${runId}`);
  const comments = await response.json();
  const commentsSec = document.getElementById("commentsSec");
  commentsSec.innerHTML = "";

  comments.forEach((comment) => {
    // 创建评论容器
    const commentDiv = document.createElement("div");
    commentDiv.className = "comment-container";

    // 创建用户名的部分
    const usernameSpan = document.createElement("span");
    usernameSpan.className = "comment-username";
    usernameSpan.textContent = `${comment.username}: `;

    // 创建评论内容的部分
    const contentSpan = document.createElement("span");
    contentSpan.className = "comment-content";
    contentSpan.textContent = comment.content;

    // 创建时间戳的部分
    const timestampDiv = document.createElement("div");
    timestampDiv.className = "comment-timestamp";
    const date = new Date(comment.createdAt).toLocaleString();
    timestampDiv.textContent = `(${date})`;

    // 将用户名、评论内容和时间戳添加到评论容器中
    commentDiv.appendChild(usernameSpan);
    commentDiv.appendChild(contentSpan);
    commentDiv.appendChild(timestampDiv);

    // 将评论容器添加到评论部分
    commentsSec.appendChild(commentDiv);
  });
}

async function findRun() {
  var reco_runs = []

  // Get the username of the connected user
  const username = sessionStorage.getItem("username")

  try {
    //fetch all the runs the user participated in
    const response = await fetch(`/users/${username}/joinedRuns`)
    const user_runs_json = await response.json()
    //extract the array
    const user_runs = user_runs_json.joinedRuns

    // Check if the user has participated in enough runs
    if (user_runs.length >= 1) {
      //CALCULATE THE USER STATISTICS

      // Calculate the user level (using mod i.e. the value that appears the most)
      //help ; https://stackoverflow.com/questions/1053843/get-the-element-with-the-highest-occurrence-in-an-array
      function userLevel(array) {
        let object = {}
        // Count the number of appearances of each different value of level
        for (let i = 0; i < array.length; i++) {
          if (object[array[i].level]) {
            object[array[i].level] += 1
          } else {
            object[array[i].level] = 1
          }
        }
        // Assign a value guaranteed to be smaller than any number in the array
        let biggestValue = -1
        let biggestValuesKey = -1
        // Finding the biggest value and its corresponding key
        Object.keys(object).forEach((key) => {
          let val = object[key]

          //if there are 2 levels with the same level of occurences we always prefer the easier level
          if (val === biggestValue) {
            if (level(key) - level(biggestValuesKey) < 0) {
              biggestValue = val
              biggestValuesKey = key
            }
          } else if (val > biggestValue) {
            biggestValue = val
            biggestValuesKey = key
          }
        })
        return biggestValuesKey
      }

      // Level compatibility
      //we associate a number to each level for calculation purposes
      function level(level) {
        if (level === "expert") {
          return 3
        } else if (level === "intermediate") {
          return 2
        } else if (level === "newbie") {
          return 1
        } else {
          return 0
        }
      }

      // Calculate the user average pace
      //help for .reduce : https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce
      function avgPace(array) {
        const sum_pace = array.reduce(
          (total, next) => total + next.expectedPace,
          0
        )
        const avg_pace = sum_pace / array.length
        return avg_pace
      }

      //we calculate the average number of participants for the runs the user participated in
      function avgNumParticipant(array) {
        const sum_nb = array.reduce(
          (total, next) => total + next.participants.length,
          0
        )
        const avg_nb = sum_nb / array.length
        return avg_nb
      }

      //calculate the average start time
      function avgStartTime(array) {
        const sum = array.reduce(
          (total, next) => total + new Date(next.startTime).getHours(),
          0
        )
        const avg_time = sum / array.length
        return avg_time
      }

      //Get the user stats
      const user_level = userLevel(user_runs)
      const user_avg_pace = avgPace(user_runs)
      const user_avg_num_participant = avgNumParticipant(user_runs)
      const user_avg_startTime = avgStartTime(user_runs)

      //we display the users stats for testing purposes
      console.log(
        `User : level : ${user_level} / pace : ${user_avg_pace} / participants : ${user_avg_num_participant} / start time : ${user_avg_startTime}`
      )

      // TO ADD: avg start time and address

      //get the runs the user has not participated in yet
      const response = await fetch("/runs")
      const runs = await response.json()
      filtered_runs = runs.filter((run) => {
        return !run.participants.includes(username)
      })

      if (filtered_runs.length >= 1) {
        //Now that we have the user statistics we compute the compatibility score for each run the user did not participated in
        filtered_runs.forEach((run) => {
          //initialise the variables fro the compatibility score
          let score = 0
          const max_level_score = 3
          const max_pace_score = 6
          const max_participants_score = 2
          const max_startTime_score = 4

          //Level compatibility
          score +=
            max_level_score - Math.abs(level(run.level) - level(user_level))

          // Pace compatibility
          let pace_diff = Math.abs(user_avg_pace - run.expectedPace)
          score += max_pace_score / (pace_diff + 1)

          // Number participants compatibility
          let participants_diff = Math.abs(
            user_avg_num_participant - run.participants.length
          )
          score += max_participants_score / (participants_diff + 1)

          //start time compatibility(in hours)
          let startTime_diff = Math.abs(
            user_avg_startTime - new Date(run.startTime).getHours()
          )
          console.log("startTime_diff" + startTime_diff)
          // Calculate the score based on the inverse proportionality for startTime
          score += max_startTime_score / (startTime_diff + 1)

          // Calculate total achievable score
          const total_max_score =
            max_pace_score +
            max_participants_score +
            max_level_score +
            max_startTime_score

          // Calculate percentage
          const percent_score = (score / total_max_score) * 100
          // Ensure the percentage is within the range [0, 100] and with 2 decimals
          var final_percent_score = Math.min(
            Math.max(percent_score, 0),
            100
          ).toFixed(2)

          //add the run to an array
          reco_runs.push({ score: final_percent_score, info: run })
        })
      } else {
        alert(
          "You participated in all the runs> We are unable to recommend new runs !"
        )
      }

      //we sort the array in deacrising order based on the score
      reco_runs.sort((a, b) => b.score - a.score)
      console.log(reco_runs)

      //we display the recommended runs in the html page
      const listElement = document.getElementById("reco-run")
      listElement.innerHTML = "" // Clear the list before adding new elements
      listElement.className = "runs-grid" // Assign a class for styling the grid

      reco_runs.forEach((run) => {
        const now = new Date()
        const startTime = new Date(run.info.startTime)
        let statusBadgeClass = "status-Upcoming"
        let status = "Upcoming" // Default status
        if (now > startTime) {
          status = "Expired" // If the current time is past the start time
          statusClass = "status-Expired"
        }

        const levelBadgeClass = `level-${run.info.level?.toLowerCase()}`

        const item = document.createElement("div")
        item.className = "run-item" // Add a class for styling
        item.innerHTML = `
            <h3>${run.info.name}
          
            </h3>
            <div>
            <span class="badge ${levelBadgeClass}">${run.info.level}</span>
            <span class="badge ${statusBadgeClass}">${status}</span></div>
            <p>Start Time: ${startTime.toLocaleString()}</p>
            <p>Start Point: ${run.info.startPointName}</p>
            <p>End Point: ${run.info.endPointName}</p>
            <p>Expected Pace: ${run.info.expectedPace}</p>
            <p>Recommendation score: ${run.score}%</p>
            <button onclick="viewRunDetails('${run.info._id
          }')">See Detail</button>
            `
        listElement.appendChild(item)
      })
    }
  } catch (error) {
    console.error("Error finding runs:", error)
    alert("An error occurred while finding runs. Please try again later.")
  }
}

async function Weather(runId, startPointCoords, startTime) {
  // Format startTime as YYYY-MM-DD
  const date = new Date(startTime);
  const targetDate = date.toISOString().split('T')[0];
  const url = `/weather?runId=${runId}&lat=${startPointCoords[0]}&lon=${startPointCoords[1]}&startTime=${targetDate}`;
  try {
    const response = await fetch(url);
    const weatherData = await response.json();
    console.log("weather", weatherData);
    const showWeather = document.getElementById("weather");
// If weatherData exists and contains the day attribute, it means that we have weather data for a specific day.
    if (weatherData && weatherData.day) {
      const weatherInfo = weatherData.day;
      showWeather.innerHTML = `
        <h3>Weather Forecast for ${weatherData.date}</h3>
        <img src="https:${weatherInfo.condition.icon}" alt="${weatherInfo.condition.text}">
        <p>Max Temperature: ${weatherInfo.maxtemp_c}°C</p>
        <p>Min Temperature: ${weatherInfo.mintemp_c}°C</p>
        <p>Condition: ${weatherInfo.condition.text}</p>
        <p>Chance of Rain: ${weatherInfo.daily_chance_of_rain}%</p>
        <p>UV Index: ${weatherInfo.uv}</p>
      `;
    } else {
      showWeather.innerHTML = `<p>Sorry, we can only predict the weather within 15 days.</p>`;
    }
  } catch (error) {
    console.error("Error fetching weather data:", error);
    showWeather.innerHTML = `<p>Error fetching weather forecast.</p>`;
  }
}

function generateUUID() {
  return "xxxx-xxxx-xxxx-xxxx".replace(/[x]/g, function (c) {
    const r = (Math.random() * 16) | 0
    return r.toString(16)
  })
}

function addOrUpdateMarker(lngLat, type) {
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

function updateRouteOnMap(route) {
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


