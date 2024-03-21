const express = require("express")
const expressBasicAuth = require("express-basic-auth")

const app = express()
const port = 5500
const { nanoid } = require("nanoid") // for generating unique ids

const MongoClient = require("mongodb").MongoClient
const { insertStarterData } = require("./db/db-setup")

// const config = require("./db/config-db.js")
const url = "mongodb://localhost:27017"
const client = new MongoClient(url)

let runsCollection = null
let usersCollection = null

//connect to the database
client
  .connect()
  //NOTE: the regular expression replaces the password with **** so it is not printed in plain text to the console!
  .then((conn) => {
    //if the collection does not exist it will automatically be created
    const db = client.db()
    runsCollection = db.collection("runs")
    usersCollection = db.collection("users")

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
  .then(() => insertStarterData(runsCollection, usersCollection))
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
    const results = await runsCollection.find({}).toArray()
    res.json(results)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "An error occurred" })
  }
})

// Create new runs
app.post("/runs", async (req, res) => {
  const runData = { ...req.body, id: nanoid() } // Construct a run data
  try {
    await runsCollection.insertOne(runData)
    res.json("Run added successfully")
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
