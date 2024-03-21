document.addEventListener("DOMContentLoaded", () => {
  toggleSections(true) //ensure that when page loads, only show the auth form

  document
    .getElementById("create-run")
    .addEventListener("submit", async (e) => {
      e.preventDefault()
      const startTime = document.getElementById("start-time").value
      const startPoint = document.getElementById("start-point").value
      const endPoint = document.getElementById("end-point").value
      const expectedPace = document.getElementById("expected-pace").value

      const name = document.getElementById("name").value
      const description = document.getElementById("description").value

      const runData = {
        startTime,
        startPoint,
        endPoint,
        expectedPace,
        name,
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
    })

  window.viewRunDetails = (runId) => {
    // Hide other sections
    document.getElementById("create-run").style.display = "none"
    document.getElementById("run-list").style.display = "none"
    // More logic to fetch and display details for the specified run

    const detailsSection = document.getElementById("run-details")
    detailsSection.innerHTML = `<h2>Run Details for ID: ${runId}</h2>` // Replace this with your own logic to fetch and display run details
    detailsSection.style.display = "block"
  }

  const loadRuns = async () => {
    const response = await fetch("/runs")
    const runs = await response.json()

    const listElement = document.getElementById("run-list")
    listElement.innerHTML = "" // Clear the list before adding new elements
    runs.forEach((run) => {
      const item = document.createElement("div")
      item.className = "run-item" // Add a class for styling
      item.innerHTML = `
            <h3>${run.name}</h3>
            <p>Start Time: ${new Date(run.startTime).toLocaleString()}</p>
            <p>Start Point: ${run.startPoint}</p>
            <p>End Point: ${run.endPoint}</p>
            <p>Expected Pace: ${run.expectedPace}</p>
            <button onclick="viewRunDetails('${run._id}')">See Detail</button>
        `
      listElement.appendChild(item)
    })
  }

  loadRuns() // Load the list when the page is ready

  login_btn = document.getElementById("log-in")
  login_btn.addEventListener("click", login)

  function parseResponse(response) {
    return response.json()
  }

  function login() {
    console.log("log in started")
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
        toggleSections(false) // login successfully, so hide auth form, show other sections
        alert(`${data.username} logged in!`)
      })
      .catch((error) => {
        console.error("Login failed:", error)
      })
  }

  const logout_btn = document.getElementById("btnLogout")
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
    document.getElementById("logout").style.display = showLogin
      ? "none"
      : "block"
    document.getElementById("create-run").style.display = showLogin
      ? "none"
      : "block"
    document.getElementById("run-list").style.display = showLogin
      ? "none"
      : "block"
  }
})
