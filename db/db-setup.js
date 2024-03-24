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
        name: "Morning Park Run",
        startTime: new Date("2024-04-19T07:00:00Z"),
        endPoint: "-2.97019,56.460594",
        startPoint: "-2.802661,56.3434325",
        startPointName:
          "The Royal and Ancient Golf Club of St Andrews, The Links, St. Andrews, Scotland KY16 9AB, United Kingdom",
        endPointName: "Dundee, Dundee City, Scotland, United Kingdom",
        expectedPace: 10,
        description: "A lovely run through the city parks.",
        status: "active", // or 'expired'
        level: "newbie", // 'intermediate' or 'expert'
      },
      {
        _id: nanoid(),
        name: "Evening Bridge Run",
        startTime: new Date("2024-05-22T19:00:00Z"),
        startPoint: "56.0212,-3.3978",
        endPoint: "56.0412,-3.3978",
        startPointName: "Old Bridge",
        endPointName: "New Bridge",
        expectedPace: 8,
        description: "Bridge to bridge run at sunset.",
        status: "active", // or 'expired'
        level: "intermediate", // 'newbie' or 'expert'
      },
      {
        _id: nanoid(),
        name: "Evening Bridge Run",
        startTime: new Date("2024-05-22T19:00:00Z"),
        startPoint: "56.0212,-3.3978",
        endPoint: "56.0412,-3.3978",
        startPointName: "Old Bridge",
        endPointName: "New Bridge",
        expectedPace: 12,
        description: "Bridge to bridge run at sunset.",
        status: "active", // or 'expired'
        level: "expert", // 'newbie' or 'expert'
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
