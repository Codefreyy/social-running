const { nanoid } = require("nanoid")

async function clearDatabase(runsCollection, usersCollection) {
  await runsCollection.deleteMany({})
  await usersCollection.deleteMany({})
}

async function insertStarterData(runsCollection, usersCollection) {
  await clearDatabase(runsCollection, usersCollection) // clear the database first after connection, in case old data interference

  await insertRuns(runsCollection)
  await insertUsers(usersCollection)
}

async function insertRuns(runsCollection) {
  //insert data into our runs collection
  return runsCollection
    .insertMany([
      {
        _id: nanoid(),
        name: "North Queensferry to Dalmeny Estate and back",
        startTime: "2024-04-19T10:00", // Combined date and time
        startPoint: "56.0012:-3.3978", // Example latitude and longitude
        endPoint: "56.0012:-3.3978",
        expectedPace: "9.5 minute miles",
        description:
          "Starting at North Queensferry, cross the Forth Road Bridge into South Queensferry, along cycle path to Dalmeny then into Dalmeny Estate before returning to South Queensferry then back across the bridge.",
      },
      {
        _id: nanoid(),
        name: "Black Mountains Trail Half-Marathon",
        startTime: "2024-05-19T10:00",
        startPoint: "51.8798858:-3.1150119",
        endPoint: "51.8791546:-3.1148286",
        expectedPace: "11 minute miles",
        description:
          "Starting with a short climb onto the Table Mountain, up through the valley to summit of PenTwyn Glas, continue on this ridge until you descend into McNamara’s Pass...",
        route: "Blacks-Mountain-Half-Marathon-2019.gpx",
      },
    ])
    .then((res) => console.log("Data inserted with IDs", res.insertedIds))
    .catch((err) => {
      console.log("Could not add data ", err.message)
      if (err.name != "BulkWriteError" || err.code != 11000) throw err
    })
}

async function insertUsers(usersCollection) {
  return usersCollection.insertMany([
    {
      _id: nanoid(),
      username: "admin",
      password: "admin",
      email: "admin@example.com",
    },
    {
      _id: nanoid(),
      username: "user1",
      password: "user1",
      email: "user1@example.com",
    },
    {
      _id: nanoid(),
      username: "user2",
      password: "user2",
      email: "user2@example.com",
    },
  ])
}

module.exports = { insertStarterData }
