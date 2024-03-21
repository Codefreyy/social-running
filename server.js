const express = require("express")
const MongoClient = require("mongodb").MongoClient

//build our url from our config file info
const config = require("./config-db.js")
const url = `mongodb://${config.username}:${config.password}@${config.url}:${config.port}/${config.database}?authSource=admin`
const client = new MongoClient(url)
let collection = null //we will give this a value after we connect to the database

//insert data into our collection
const insertManyStarterData = async function () {
  return collection
    .insertMany([
      { _id: "1", name: "Toy Story", type: "cartoon", year: 1996 },
      { _id: "2", name: "Monsters Inc", type: "cartoon", year: 2002 },
      { _id: "3", name: "Wall-E", type: "cartoon", year: 2008 },
      { _id: "4", name: "Finding Nemo", type: "cartoon", year: 2003 },
      { _id: "5", name: "The Omen", type: "horror", year: 1976 },
      { _id: "6", name: "The Exorcist", type: "horror", year: 1974 },
      { name: "The Hunchback of Notre Dame", type: "cartoon", year: 1996 },
      { name: "Bady's 1st Birthday", type: "home-movie", year: 2002 },
    ])
    .then((res) => console.log("Data inserted with IDs", res.insertedIds))
    .catch((err) => {
      console.log("Could not add data ", err.message)
      //For now, ingore duplicate entry errors, otherwise re-throw the error for the next catch
      if (err.name != "BulkWriteError" || err.code != 11000) throw err
    })
}

const insertOneStarterData = async function () {
  return collection
    .insertOne({ _id: "7", name: "The Shining", type: "horror", year: 1980 })
    .then((res) => console.log("Data inserted with ID", res.insertedId))
    .catch((err) => {
      console.log("Could not add data ", err.message)
      //For now, ingore duplicate entry errors, otherwise re-throw the error for the next catch
      if (err.name != "MongoError" || err.code != 11000) throw err
    })
}

//connect to the database
client
  .connect()
  //NOTE: the regular expression replaces the password with **** so it is not printed in plain text to the console!
  .then((conn) => {
    //if the collection does not exist it will automatically be created
    collection = client.db().collection(config.collection)
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
  .then(() => insertManyStarterData())
  .then(() => insertOneStarterData())
  //exit gracefully from any errors
  .catch((err) => {
    console.log("Giving up!", err.message)
  })
  .finally(() => {
    client.close()
    console.log("Disconnected")
  })

//

const app = express()
const port = 5500

app.use(express.static("public"))
app.use(express.json()) // parse the req body as json

// create new runs
// app.post("/runs", (req, res) => {
//   const runData = { ...req.body, id: nanoid() } // construct a run data
//   const newRun = new Run(runData) // create a new run instance
//   newRun
//     .save() // save to database
//     .then(() => {
//       res.json("Run added successfully")
//     })
//     .catch((error) => {
//       console.error(error)
//       res.status(500).json({ error: "An error occurred" })
//     })
// })

// // get all runs data
// app.get("/runs", (req, res) => {
//   Run.find() // 查找所有 Run 实例
//     .then((results) => {
//       res.json(results)
//     })
//     .catch((error) => {
//       console.error(error)
//       res.status(500).json({ error: "An error occurred" })
//     })
// })

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
