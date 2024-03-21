const { nanoid } = require("nanoid")

async function insertStarterData(runsCollection, usersCollection) {
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
        date: "2024-04-19",
        time: "10:00",
        distance: "Approx 11 miles",
        pace: "Approx 9.5 minute miles",
        description:
          "Starting at North Queensferry, cross the Forth Road Bridge into South Queensferry, along cycle path to Dalmeny then into Dalmeny Estate before returning to South Queensferry then back across the bridge.",
        startingPoint: "Carpark at Doubletree (next to Forth Road Bridge)",
        endPoint: "Carpark at Doubletree (next to Forth Road Bridge)",
      },
      {
        _id: nanoid(),
        name: "Black Mountains Trail Half-Marathon",
        date: "2024-05-19",
        time: "10:00",
        distance: "13.1 miles",
        pace: "Approx 11 minute miles",
        description:
          "Starting with a short climb onto the Table Mountain, up through the valley to summit of PenTwyn Glas, continue on this ridge until you descend into McNamara’s Pass, leaving the base of the valley, follow an ancient wall, follow forest trails, then cross streams and fields climbing to retrace earlier steps.",
        startingPoint: "latitude: 51.8798858, longitude: -3.1150119",
        endPoint: "latitude: 51.8791546, longitude: -3.1148286",
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
