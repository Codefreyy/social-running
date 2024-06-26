const express = require("express")

const app = express()
const port = 5500
const { nanoid } = require("nanoid") // for generating unique ids

const MongoClient = require("mongodb").MongoClient
const { insertStarterData } = require("./db/db-setup") // populate data

const config = require("./db/config-db.js")
// MongoDB URL with credentials.
const url = `mongodb://${config.username}:${config.password}@${config.url}:${config.port}/${config.database}?authSource=admin`
const client = new MongoClient(url)

let runsCollection = null
let usersCollection = null
let commentsCollection = null

// Connect to MongoDB and initialize collections.
client
  .connect()
  .then((conn) => {
    const db = client.db()
    runsCollection = db.collection("runs")
    usersCollection = db.collection("users")
    commentsCollection = db.collection("comments")

    console.log("Connected!", conn.s.url.replace(/:([^:@]{1,})@/, ":****@"))
  })
  .catch((err) => {
    console.log(
      `Could not connect to ${url.replace(/:([^:@]{1,})@/, ":****@")}`,
      err
    )
    throw err
  })
  .then(() =>
    insertStarterData(runsCollection, usersCollection, commentsCollection)
  )
  .catch((err) => {
    console.log("Giving up!", err.message)
  })

app.use(express.static("content"))
app.use(express.json()) // parse the req body as json

// User login route
app.post("/login", async function (req, res) {
  const { username, password, sessionId } = req.body
  try {
    const user = await usersCollection.findOne({ username })
    if (user && password === user.password) {
      // Update the user document with the sessionId
      await usersCollection.updateOne({ username }, { $set: { sessionId } })
      res.status(200).json({ username: user.username, sessionId })
    } else {
      res.status(400).json({ error: "Invalid credentials" })
    }
  } catch (error) {
    // Server error
    res.status(500).json({ error: "Internal server error" })
  }
})

// User logout route
app.post("/logout", async (req, res) => {
  const { username, sessionId } = req.body
  try {
    const user = await usersCollection.findOne({ username })
    // clear session ID
    if (user && user.sessionId === sessionId) {
      await usersCollection.updateOne(
        { username },
        { $unset: { sessionId: "" } }
      )
      res.status(200).json({ message: "Logged out successfully" })
    } else {
      res.status(403).json({ error: "Invalid session or user" })
    }
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// User registration route
app.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body
    // check if user exists
    const existingUser = await usersCollection.findOne({ username })
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" })
    }
    const userId = await createNewUser(username, password)
    res.status(200).json({ success: true, userId: userId })
  } catch (error) {
    res.status(400).json({ success: false, message: error.message })
  }
})

async function createNewUser(username, password) {
  if (
    typeof username !== "string" ||
    typeof password !== "string" ||
    password.length > 30 ||
    username.length > 30
  ) {
    throw new Error("Invalid username or password length.")
  }

  let userIdNanoid = nanoid(7)

  try {
    await usersCollection.insertOne({
      userId: userIdNanoid,
      username: username,
      password: password,
    })
    return userIdNanoid
  } catch (error) {
    console.error(" Register Error ")
    throw new Error(" Register Error ")
  }
}

// Create a new run
app.post("/runs", async (req, res) => {
  const {
    startTime,
    startPoint,
    endPoint,
    expectedPace,
    name,
    level,
    description,
    startPointName,
    endPointName,
    meetingPoints,
  } = req.body
  const runData = {
    _id: nanoid(),
    startTime,
    startPoint,
    endPoint,
    startPointName,
    endPointName,
    expectedPace,
    name,
    level,
    description,
    meetingPoints: meetingPoints.map((mp) => ({
      name: mp.name,
      coordinates: mp.coordinates,
    })),
    createdAt: new Date(),
  }
  try {
    await runsCollection.insertOne(runData)
    res.json({ message: "Run added successfully" })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "An error occurred" })
  }
})

// Get details of a specific run by ID
app.get("/runs/:id", async (req, res) => {
  const { id } = req.params
  try {
    const result = await runsCollection.findOne({ _id: id })
    if (result) {
      res.json(result)
    } else {
      res.status(404).json({ error: "Run not found" })
    }
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "An error occurred" })
  }
})

// Route to get a list of runs, optionally filter by level and pace
app.get("/runs", async (req, res) => {
  try {
    let filter = {} // Default filter to retrieve all runs

    // Check if a level query parameter is provided
    if (req.query.level) {
      const level = req.query.level.toLowerCase()
      // Filter runs based on the level
      if (
        level === "newbie" ||
        level === "intermediate" ||
        level === "expert"
      ) {
        filter.level = level // Set the filter level
      } else if (level == "all") {
        filter = {}
      } else {
        return res.status(400).json({ error: "Invalid level parameter" })
      }
    }

    // Check if a pace query parameter is provided
    if (req.query.pace) {
      const pace = parseFloat(req.query.pace)
      if (!isNaN(pace)) {
        // Assuming expectedPace is stored as a number in your collection
        filter.expectedPace = { $lte: pace } // Filter for runs with expectedPace less than or equal to the provided pace
      } else {
        return res.status(400).json({ error: "Invalid pace parameter" })
      }
    }

    const results = await runsCollection
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray()

    res.json(results)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "An error occurred" })
  }
})

// Join a run by run Id
app.post("/runs/:id/join", async (req, res) => {
  const runId = req.params.id
  const { username, sessionId } = req.body

  try {
    // First, find the user to get their _id
    const user = await usersCollection.findOne({ username })
    if (!user || user.sessionId !== sessionId) {
      return res
        .status(403)
        .json({ error: "Session ID mismatch or user not found" })
    }
    // Add the user to the run's participants list
    const updatedRunInfo = await runsCollection.updateOne(
      { _id: runId },
      { $addToSet: { participants: username } }
    )

    res.json({ message: "Successfully joined the run" })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "An error occurred" })
  }
})

// Leave a run by run ID
app.post("/runs/:id/leave", async (req, res) => {
  const runId = req.params.id
  const { username, sessionId } = req.body

  try {
    const user = await usersCollection.findOne({ username })
    if (!user || user.sessionId !== sessionId) {
      return res
        .status(403)
        .json({ error: "Session ID mismatch or user not found" })
    }
    await runsCollection.updateOne(
      { _id: runId },
      { $pull: { participants: username } }
    )
    res.json({ message: "Successfully left the run" })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "An error occurred" })
  }
})

// Get number of participants of specific run by ID
app.get("/runs/:id/participants", async (req, res) => {
  const runId = req.params.id

  try {
    const run = await runsCollection.findOne({ _id: runId })
    if (!run) {
      return res.status(404).json({ error: "Run not found" })
    }
    const participantCount = run.participants ? run.participants.length : 0
    res.json({ participantCount })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "An error occurred" })
  }
})

// Get the list of runs a user has joined by username
app.get("/users/:username/joinedRuns", async (req, res) => {
  const { username } = req.params

  try {
    const joinedRuns = await runsCollection
      .find({ participants: username })
      .toArray()
    res.json({ joinedRuns })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "An error occurred" })
  }
})

app.post("/comments", async (req, res) => {
  const { content, runId, username } = req.body
  //Get the required data
  const commentText = {
    _id: nanoid(),
    runId,
    username,
    content,
    createdAt: new Date(),
  }
  try {
    await commentsCollection.insertOne(commentText) //Insert comment's content into database
    res.json({ message: "comment saved" })
  } catch (error) {
    res.status(500).json({ message: "An error occurred while saving comments" })
  }
})

// get all the comments of a run by runId
app.get("/comments", async (req, res) => {
  try {
    const { runId } = req.query
    // Find all reviews in the database whose runId matches the given runId and convert the result to an array.
    const comments = await commentsCollection.find({ runId: runId }).toArray()
    res.json(comments)
  } catch (error) {
    res
      .status(500)
      .json({ message: "An error occurred while getting comments" })
  }
})

// Get weather data by coordinates and startTime of the run
app.get("/weather", async (req, res) => {
  const { lat, lon, startTime } = req.query
  const date = new Date(startTime) //Get the specific date of the run
  //Format startTime as YYYY-MM-DD and only select the day
  const targetDate = date.toISOString().split("T")[0]
  //If the token not available, the user needs to register for a token from Weather API: "https://www.weatherapi.com/"
  const url = `http://api.weatherapi.com/v1/forecast.json?key=dbb28b581c6541268f4193126243103&q=${lat},${lon}&dt=${targetDate}`
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error("Failed to fetch weather data")
    }
    const data = await response.json()
    // Find the forecast for the targetDate
    const forecastForTargetDate = data.forecast.forecastday.find(
      (forecast) => forecast.date === targetDate
    )

    if (forecastForTargetDate) {
      // Return the forecast for the specific date
      res.json(forecastForTargetDate)
    } else {
      // No forecast available for the targetDate
      res.status(404).json({
        error: "Sorry, we can only predict the weather within 15 days",
      })
    }
  } catch (error) {
    console.error("Error fetching weather data:", error)
    res.status(500).json({ error: "Failed to fetch weather data" })
  }
})

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
