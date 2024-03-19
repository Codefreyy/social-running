// server
const express = require("express")
const { nanoid } = require("nanoid") // for generate unique id
const app = express()
const port = 5500

app.use(express.static("public"))

app.use(express.json()) //parse the req body as json

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
