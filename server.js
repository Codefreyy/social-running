const express = require("express")
const expressBasicAuth = require("express-basic-auth")

const app = express()
const port = 5500
const { nanoid } = require("nanoid") // for generating unique ids

const MongoClient = require("mongodb").MongoClient
const { insertStarterData } = require("./db/db-setup")

const config = require("./db/config-db.js")
// const url = "mongodb://localhost:27017"
const url = `mongodb://${config.username}:${config.password}@${config.url}:${config.port}/${config.database}?authSource=admin`
const client = new MongoClient(url)

let runsCollection = null
let usersCollection = null
let commentsCollection = null

//connect to the database
client
  .connect()
  //NOTE: the regular expression replaces the password with **** so it is not printed in plain text to the console!
  .then((conn) => {
    //if the collection does not exist it will automatically be created
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
  //interact with the database
  .then(() =>
    insertStarterData(runsCollection, usersCollection, commentsCollection)
  )
  //exit gracefully from any errors
  .catch((err) => {
    console.log("Giving up!", err.message)
  })

app.use(express.static("public"))
app.use(express.json()) // parse the req body as json

//Handling user login
app.post("/login", async function (req, res) {
  console.log("login")
  try {
    const { username, password } = req.body
    console.log({ username, password })
    // check if the user exists
    // check if the user exists
    const user = await usersCollection.findOne({ username })
    console.log(`User : ${user && user.username}`)

    if (user) {
      // Check if password matches
      if (password === user.password) {
        // Passwords match, send response
        res.status(200).json({ username: user.username })
      } else {
        // Passwords don't match
        res.status(400).json({ error: "Password doesn't match" })
      }
    } else {
      // User not found
      res.status(400).json({ error: "User doesn't exist" })
    }
  } catch (error) {
    // Server error
    console.error("Login error:", error.message)
    res.status(500).json({ error: "Internal server error" })
  }
})

// handling user register

async function createNewUser(username, password) {
  if (
    typeof username !== "string" ||
    typeof password !== "string" ||
    password.length > 30 ||
    username.length > 30
  ) {
    throw new Error("Invalid username or password length.")
  }

  let userIdNanoid = nanoid(7) // 生成用户ID

  try {
    await usersCollection.insertOne({
      userId: userIdNanoid,
      username: username,
      password: password,
    })
    console.log(`${userIdNanoid} registered`)
    return userIdNanoid // 返回生成的用户ID
  } catch (error) {
    console.error(" Register Error ")
    throw new Error(" Register Error ")
  }
}

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
    console.log({ userId })
    res.status(200).json({ success: true, userId: userId })
  } catch (error) {
    res.status(400).json({ success: false, message: error.message })
  }
})

// Create new runs
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

// Get run details by id
app.get("/runs/:id", async (req, res) => {
  const { id } = req.params
  try {
    const result = await runsCollection.findOne({ _id: id })
    console.log(result)
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

// POST /runs/:id/join - Join a run
app.post("/runs/:id/join", async (req, res) => {
  const runId = req.params.id
  const username = req.body.username

  console.log(runId, username)

  try {
    // First, find the user to get their _id
    const user = await usersCollection.findOne({ username })
    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    // Add the user to the run's participants list
    const updatedRunInfo = await runsCollection.updateOne(
      { _id: runId },
      { $addToSet: { participants: username } }
    )

    const updatedUserInfo = await usersCollection.updateOne(
      { _id: user._id },
      { $addToSet: { joinedRuns: runId } }
    )

    res.json({ message: "Successfully joined the run" })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "An error occurred" })
  }
})

// GET /runs/:id/participants - Get number of participants
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

// Get the list of runs a user has joined
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

//temporary db for testing purposes
db_temp = { username: null, password: null, email: null }

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})

app.post("/comments", async (req, res) => {
  const { content, runId, username } = req.body
  const commentText = {
    _id: nanoid(),
    runId,
    username,
    content,
    createdAt: new Date(),
  }
  console.log(req.body)
  try {
    await commentsCollection.insertOne(commentText)
    res.json({ message: "comment saved" })
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "An error occurred while saving comments" })
  }
})

app.get("/comments", async (req, res) => {
  try {
    const { runId } = req.query
    const comments = await commentsCollection.find({ runId: runId }).toArray()
    res.json(comments)
  } catch (error) {
    console.log(error)
    res
      .status(500)
      .json({ message: "An error occurred while getting comments" })
  }
})

// Get runs with filtering by level
app.get("/runs", async (req, res) => {
  try {
    let filter = {} // Default filter to retrieve all runs

    // Check if a level query parameter is provided
    if (req.query.level) {
      const level = req.query.level.toLowerCase()
      console.log("Received level filter:", level) // Log the received level filter
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

    console.log("Filtered runs:", results) // Log the filtered runs
    res.json(results)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "An error occurred" })
  }
})
