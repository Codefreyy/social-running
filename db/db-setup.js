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

        level: "newbie", // 'intermediate' or 'expert'
      },
      {
        _id: nanoid(),
        startTime: "2024-05-24T08:54",
        startPoint: "119.543271,26.669501",
        startPointName: "Ningde Shi, Fujian, China",
        endPointName: "Fuzhou Shi, Fujian, China",
        endPoint: "119.291821,26.077495",
        expectedPace: "10",
        name: "Run Run Run",
        level: "intermediate",
        description: "This is a very long run",
      },
      {
        _id: nanoid(),

        startTime: "2024-03-29T00:02",
        startPoint: "-0.127647,51.5073",
        startPointName: "London, Greater London, England, United Kingdom",
        endPointName: "Edinburgh, City of Edinburgh, Scotland, United Kingdom",
        endPoint: "-3.188375,55.953346",
        expectedPace: "12",
        name: "Run across UK",
        level: "expert",
        description: "This is a great run! Welcome!",
      },
      {
        _id: nanoid(),
        startTime: "2024-03-30T14:11",
        startPoint: "116.3912757,39.906217",
        endPoint: "117.190408,39.146857",
        startPointName: "Beijing, China",
        endPointName: "Hebei Qu, Tianjin, China",
        expectedPace: "9",
        name: "Run Captital",
        description: "Will be fun!",
      },
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

        level: "newbie", // 'intermediate' or 'expert'
      },
      {
        _id: nanoid(),

        startTime: "2024-03-29T00:02",
        startPoint: "-0.127647,51.5073",
        startPointName: "London, Greater London, England, United Kingdom",
        endPointName: "Edinburgh, City of Edinburgh, Scotland, United Kingdom",
        endPoint: "-3.188375,55.953346",
        expectedPace: "12",
        name: "Run across UK",
        level: "expert",
        description: "This is a great run! Welcome!",
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
