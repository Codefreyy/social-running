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

const users = {
  admin: "admin",
  user1: "user1",
  user2: "user2",
}

app.use(express.static("public"))
app.use(express.json()) // parse the req body as json

// get runs
app.get("/runs", async (req, res) => {
  try {
    const results = await runsCollection
      .find({})
      .sort({ createdAt: -1 })
      .toArray()
    res.json(results)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "An error occurred" })
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
    const updatedInfo = await runsCollection.updateOne(
      { _id: runId },
      { $addToSet: { participants: username } } // Use $addToSet to avoid duplicate entries
    )
    if (updatedInfo.matchedCount === 0) {
      return res.status(404).json({ error: "Run not found" })
    }
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

//register the valid username, password pairs with the express-basic-auth object
const authorise = expressBasicAuth({
  users: users,
  unauthorizedResponse: (req) =>
    req.auth ? "Credentials  rejected" : "No credentials provided",
  challenge: true, //make the browser ask for credentials if none/wrong are provided
})

app.post("/login", authorise, (req, res) => {
  //get the user data
  const username = req.auth.user
  const password = req.auth.password

  //update database
  db_temp.username = username
  db_temp.password = password
  res.status(200).json(db_temp)
  console.log(`user loged in : ${username} with the password ${password}`)
})

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
