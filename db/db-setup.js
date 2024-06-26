/**
 * We're inserting 20 runs with varied level values to simulate different skill levels. We're creating 20 users.
The assignUsersToRuns function assigns users to runs in a somewhat random manner to simulate participation.
The insertComments function has been modified to insert comments for the runs based on the participants, ensuring that there's relevant data for each run.
This setup provides a rich dataset for simulating different scenarios in your application, including user participation across various runs and engagement through comments.
 */

const { nanoid } = require("nanoid")

async function clearDatabase(
  runsCollection,
  usersCollection,
  commentsCollection
) {
  await runsCollection.deleteMany({})
  await usersCollection.deleteMany({})
  await commentsCollection.deleteMany({})
}

async function insertStarterData(
  runsCollection,
  usersCollection,
  commentsCollection
) {
  await clearDatabase(runsCollection, usersCollection, commentsCollection)

  await insertRuns(runsCollection)
  await insertUsers(usersCollection)
  await assignUsersToRuns(usersCollection, runsCollection)
  await insertComments(commentsCollection, runsCollection, usersCollection)
}

async function insertRuns(runsCollection) {
  const locations = [
    {
      name: "Central Park Run",
      city: "New York",
      country: "USA",
      pace: 9,
      level: "newbie",
      coordinates: [-73.965355, 40.782865], // Central Park
    },
    {
      name: "Hyde Park Hustle",
      city: "London",
      country: "UK",
      pace: 11,
      level: "intermediate",
      coordinates: [-0.16573, 51.507268], // Hyde Park
    },
    {
      name: "Seine River Sprint",
      city: "Paris",
      country: "France",
      pace: 7,
      level: "expert",
      coordinates: [2.321235, 48.859489], // Seine River
    },
    {
      name: "Ueno Park Loop",
      city: "Tokyo",
      country: "Japan",
      pace: 10,
      level: "newbie",
      coordinates: [139.771987, 35.715633], // Ueno Park
    },
    {
      name: "Tiergarten Trek",
      city: "Berlin",
      country: "Germany",
      pace: 12,
      level: "intermediate",
      coordinates: [13.350137, 52.514503], // Tiergarten
    },
    {
      name: "Royal Botanic Run",
      city: "Melbourne",
      country: "Australia",
      pace: 8,
      level: "expert",
      coordinates: [144.983398, -37.830369], // Royal Botanic Gardens, Melbourne
    },
  ]

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max)
  }

  let runs = locations.map((loc, index) => {
    // Generating a small random offset for end points to simulate a path
    const offsetLat = Math.random() * 0.01 - 0.01
    const offsetLng = Math.random() * 0.01 - 0.01

    // Clamp values to ensure they're within valid ranges
    const endLat = clamp(loc.coordinates[1] + offsetLat, -90, 90)
    const endLng = clamp(loc.coordinates[0] + offsetLng, -180, 180)

    return {
      _id: nanoid(),
      name: loc.name,
      startTime: new Date(2024, 3, (index % 21) + 10, 8, 0, 0),
      startPoint: loc.coordinates.join(","),
      endPoint: [endLng, endLat].join(","),
      startPointName: `${loc.city}, ${loc.country}`,
      endPointName: `End Point near ${loc.city}`,
      expectedPace: loc.pace,
      description: `${loc.name} in beautiful ${loc.city}, ${loc.country}. Perfect for ${loc.level} runners.`,
      level: loc.level,
      participants: [],
    }
  })
  const runs1 = await runsCollection.insertMany(runs)
}

async function insertUsers(usersCollection) {
  let users = []
  for (let i = 0; i < 20; i++) {
    users.push({
      username: `user${i}`,
      password: "password",
      joinedRuns: [],
    })
  }

  users.push({
    username: "admin",
    password: "admin",
    joinedRuns: [],
  })
  await usersCollection.insertMany(users)
}

async function assignUsersToRuns(usersCollection, runsCollection) {
  const runs = await runsCollection.find().toArray()
  const users = await usersCollection.find().toArray()

  // Ensuring admin joins some runs
  let adminJoinedRuns = []

  for (let user of users) {
    let joinedRuns = new Set() // Use a Set to prevent duplicates easily
    let runsToJoin =
      user.username === "admin"
        ? Math.ceil(runs.length * 0.5)
        : 5 + Math.floor(Math.random() * 6)

    // Ensure runsToJoin does not exceed the total number of unique runs available
    runsToJoin = Math.min(runsToJoin, runs.length)

    while (joinedRuns.size < runsToJoin) {
      const run = runs[Math.floor(Math.random() * runs.length)]
      joinedRuns.add(run._id) // Set automatically handles duplicates

      if (!run.participants?.includes(user.username)) {
        run.participants?.push(user.username)
      }

      if (user.username === "admin") {
        adminJoinedRuns.push(run._id)
      }

      // Break if all unique runs have been added
      if (joinedRuns.size === runs.length) {
        break
      }
    }

    // Convert Set back to array for database update
    joinedRuns = [...joinedRuns]

    // Update the user with their joined runs
    await usersCollection.updateOne(
      { username: user.username },
      { $set: { joinedRuns } }
    )
  }

  // Update the runs with their participants
  for (let run of runs) {
    await runsCollection.updateOne(
      { _id: run._id },
      { $set: { participants: run.participants } }
    )
  }
}

async function insertComments(
  commentsCollection,
  runsCollection,
  usersCollection
) {
  const runs = await runsCollection.find().toArray()
  let comments = []
  runs.forEach((run) => {
    const users = run.participants
    users.forEach((username, index) => {
      if (index < 6) {
        comments.push({
          _id: nanoid(),
          runId: run._id,
          username: username,
          content: `This is a great run! Comment ${index} by ${username}`,
          createdAt: new Date(),
        })
      }
    })
  })

  await commentsCollection.insertMany(comments)
}

module.exports = { insertStarterData }
