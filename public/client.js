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
       <div class="run-details-header"> 
        <h2>${runDetails.name}</h2>
       <div>
       <button id="joinRun" data-run-id="${runDetails._id}">${
      username ? "Click to Join" : "Login to Join"
    }</button>
      <div><span id="participantCount">0 </span>People Already Join!</div></div>
      </div>
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

  document.getElementById("sign-up").addEventListener("click", handleSignUp)

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
  login_btn.addEventListener("click", () => {
    const login_username = document.getElementById("username").value
    const login_password = document.getElementById("password").value
    login(login_username, login_password)
  })

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
    const startTimeDate = new Date(startTime)
    const currentDateTime = new Date()
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

    if (!startTime || !startPoint || !endPoint || !expectedPace || !level) {
      alert("Please fill in all the fields")
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

  function parseResponse(response) {
    return response.json()
  }

  function login(username, password) {
    console.log("user", username, password)
    document.getElementById("username").value = ""
    document.getElementById("password").value = ""

    // Send login credentials to the server
    fetch("/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        password,
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
        localStorage.setItem("username", data.username)
        updateNavbar(data.username)
        loadRuns()
        toggleSections(false) // login successfully, so hide auth form, show other sections
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
    console.log(!username,!password)
    if(!username ||!password) {
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

  function updateNavbar(username) {
    const greeting = document.getElementById("user-greeting")
    if (username) {
      greeting.textContent = `Hi ${username}` // 显示问候语和用户名
    } else {
      greeting.textContent = "" // 清除问候语
    }
  }

  function toggleSections(showLogin) {
    document.getElementById("auth").style.display = showLogin ? "flex" : "none"
    document.getElementById("logout").style.display = showLogin
      ? "none"
      : "block"
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
    // clear localstorage
    localStorage.removeItem("username")

    // remove user greeting
    updateNavbar(null)

    authSection.style.display = "flex"
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

  document.getElementById("find-run-btn").addEventListener("click", findRun)

  async function findRun() {
    // Initialise the maximum compatibility score
    var max_score = -1;
    
    var recommendedRunId;
    var recommendedRunName;
  
    // Get the username of the connected user
    // MAYBE GET IT FROM DATABASE ?
    const username = localStorage.getItem("username");
    try {
      const response = await fetch(`/users/${username}/joinedRuns`);
      const user_runs_json = await response.json();
      const user_runs = user_runs_json.joinedRuns //turn it into an array

      // Print user_runs to console
      console.log("User runs:", user_runs);
      console.log(`${user_runs.length} runs joined by ${username}`);
      // Check if the user has participated in enough runs
      if (user_runs.length >= 1) {
  
        // Calculate the user level (using mod i.e. the value that appears the most)
        function userLevel(array) {
          let object = {};
          // Count the number of appearances of each different value of level
          for (let i = 0; i < array.length; i++) {
            if (object[array[i].level]) {
              object[array[i].level] += 1;
            } else {
              object[array[i].level] = 1;
            }
          }
          // Assign a value guaranteed to be smaller than any number in the array
          let biggestValue = -1;
          let biggestValuesKey = -1;
          // Finding the biggest value and its corresponding key
          Object.keys(object).forEach(key => {
            let val = object[key];
            if (val > biggestValue) {
              biggestValue = val;
              biggestValuesKey = key;
            }
          })
          return biggestValuesKey
        }
  
        // Calculate the user average pace
        function avgPace(array) {
          const sum_pace = array.reduce((total, next) => total + next.expectedPace, 0);
          const avg_pace = (sum_pace / array.length);
          return avg_pace
        }
  
        // async function NumParticipants(runId) {
        //   const response = await fetch(`/runs/${runId}/participants`)
        //   if (response.ok) {
        //     const data = await response.json()
        //     data.participantCount
        //   }
        // }
  
        // function AvgNumParticipant(array) {
        //   let participant_array = [];
  
        //   array.forEach((run) => {
        //     console.log(NumParticipants(run._id));
        //     participant_array.append(NumParticipants(run._id));
        //   })
  
        //   sum = participant_array.reduce((total, next) => total + next, 0);
        //   const avg = (sum_pace / participant_array.length);
  
        //   return avg
        // }

        // Get the user level
        const user_level = userLevel(user_runs);
        const user_avg_pace = avgPace(user_runs);
        //const user_avg_num_participant = await AvgNumParticipant(user_runs);
        console.log(`user_level : ${user_level} and user_pace : ${user_avg_pace}`);
         //and user_part : ${user_avg_num_participant}`);
  
        // TO ADD: avg start time and address
  
        user_runs.forEach((run) => {
  
          let score = 0;
  
          // Level compatibility
          if (run.level === user_level) {
            score += 3;
          }
  
          // Pace compatibility
          let pace_diff = Math.abs(user_avg_pace - run.expectedPace);
          // Calculate the score based on the inverse proportionality
          score += 6 / (pace_diff + 1);
  
          // // Number participants compatibility
          // let participants_diff = Math.abs(user_avg_num_participant - NumParticipants(run._id));
          // // Calculate the score based on the inverse proportionality
          // score += 2 / (participants_diff + 1);
          
          console.log(`score ${score}`);
          // Update max compatibility score and recommended run ID if the current run has a higher score
          if (score > max_score) {
            max_score = score;
            recommendedRunId = run._id;
            recommendedRunName = run.name;
            console.log("new best run : " + recommendedRunName);
          }
        });
  
        if (recommendedRunId) {
          alert(`The best run to join for your profile is: ${recommendedRunName} with a compatibility score of ${max_score}`);
        } else {
          alert("No suitable runs found for your profile.");
        }
      }
    } catch (error) {
      console.error("Error finding runs:", error);
      alert("An error occurred while finding runs. Please try again later.");
    }
  }




// JavaScript code for filtering
document.addEventListener("DOMContentLoaded", () => {
  const filterSelect = document.getElementById("filter-by-level");
  const runList = document.getElementById("run-list");

  // Function to fetch and display runs, optionally filtered by level
  async function displayRuns(level = "all") {
    try {
      const response = await fetch(`/runs?level=${level}`); // Fetch runs from server
      const runs = await response.json();

      if (!response.ok) {
        throw new Error(`Error fetching runs: ${response.statusText}`); // Handle non-200 responses
      }

      runList.innerHTML = ""; // Clear previous list items

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
        runList.appendChild(item);
      });
    } catch (error) {
      console.error("Error fetching runs:", error);
      runList.textContent = "Error loading runs. Please try again later."; // Display error message
    }
  }

  // Initial run list display
  displayRuns();

  // Event listener for filter changes
  filterSelect.addEventListener("change", (event) => {
    const selectedLevel = event.target.value;
    displayRuns(selectedLevel);
  });
});
});
