const express = require("express")
const { nanoid } = require("nanoid") // for generating unique ids
const expressBasicAuth = require('express-basic-auth');
const app = express()
const port = 5500

// const { Run } = require("./db")

const users = {
  'admin': 'admin',
  'user1': 'user1',
  'user2': 'user2'
}

app.use(express.static("public"))
app.use(express.json()) // parse the req body as json

// create new runs
app.post("/runs", (req, res) => {
  const runData = { ...req.body, id: nanoid() } // construct a run data
  const newRun = new Run(runData) // create a new run instance
  newRun
    .save() // save to database
    .then(() => {
      res.json("Run added successfully")
    })
    .catch((error) => {
      console.error(error)
      res.status(500).json({ error: "An error occurred" })
    })
})

// get all runs data
app.get("/runs", (req, res) => {
  Run.find() // 查找所有 Run 实例
    .then((results) => {
      res.json(results)
    })
    .catch((error) => {
      console.error(error)
      res.status(500).json({ error: "An error occurred" })
    })
})

//temporary db for testing purposes
db_temp = { username: null, password: null, email: null};

//register the valid username, password pairs with the express-basic-auth object
const authorise = expressBasicAuth({
  users: users,
unauthorizedResponse: (req) => ((req.auth)? 'Credentials  rejected' : 'No credentials provided'),
challenge: true	//make the browser ask for credentials if none/wrong are provided
})

app.post('/login', authorise, (req, res) => {
  //get the user data
  const username = req.auth.user;
  const password = req.auth.password;
  //update database
  db_temp.username = username;
  db_temp.password = password;
  res.status(200).json(db_temp);
  console.log(`user loged in : ${username} with the password ${password}`);

})

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})

