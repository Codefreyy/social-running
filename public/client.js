document.addEventListener("DOMContentLoaded", () => {
  document
    .getElementById("create-run")
    .addEventListener("submit", async (e) => {
      e.preventDefault()
      const startTime = document.getElementById("start-time").value
      const startPoint = document.getElementById("start-point").value
      const endPoint = document.getElementById("end-point").value
      const expectedPace = document.getElementById("expected-pace").value

      const runData = { startTime, startPoint, endPoint, expectedPace }

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
      item.textContent = `Start Time: ${run.startTime}, Start Point: ${run.startPoint}, End Point: ${run.endPoint}, Pace: ${run.expectedPace}`
      listElement.appendChild(item)
    })
  }

  loadRuns() // Load the list when the page is ready


  login_btn = document.getElementById("log-in");
  login_btn.addEventListener("click", Log_in);

  function Log_in() {
    console.log("log in ");
  }
})
