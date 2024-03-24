document.addEventListener("DOMContentLoaded", () => {
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

  const loadRuns = async () => {
    const response = await fetch("/runs")
    const runs = await response.json()

    const listElement = document.getElementById("run-list")
    listElement.innerHTML = "" // Clear the list before adding new elements
    runs.forEach((run) => {
      const item = document.createElement("div")
      item.textContent = `Start Time: ${run.startTime}, Start Point: ${run.startPoint}, End Point: ${run.endPoint}, Expected Pace: ${run.expectedPace}`
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
        alert(
          `${data.username} logged in with the following password : ${data.password}`
        )
      })
      .catch((error) => {
        console.error("Login failed:", error)
      })
  }


  const logout_btn = document.getElementById("btnLogout");
  logout_btn.addEventListener("click", logout);

  function logout() {
    fetch("/logout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      }
    })
      .then(response => response.json())
      .then(data => {
        console.log(data);
      })
      .catch(error => {
        console.error("Logout failed:", error);
      });
  }

})





document.addEventListener('DOMContentLoaded', async () => {
  const subBtn = document.getElementById("comSubmit")
  const comContent = document.getElementById("comments")
  const comInput = document.getElementById("comInput")
  const commentsSec = document.getElementById("commentsSec")

  async function showComments() {
    const response = await fetch('/comments')
    const comments = await response.json()
    commentsSec.innerHTML = ""
    comments.forEach(comment => {
      const comDetail = document.createElement("p")
      const date = new Date(comment.createdAt).toLocaleString()
      comDetail.textContent = `${comment.username}: ${comment.content} (${date})`
      commentsSec.appendChild(comDetail)
    })
    console.log(comments);
  }
  subBtn.addEventListener('click', async () => {
    const commentText = comInput.value
    if (commentText) {
      const response = await fetch('/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: commentText }),
      });
      if (response.ok) {
        comInput.value = '';
        showComments(); // Re-fetch and display all comments
      } 
    }
  })
  showComments()
})




