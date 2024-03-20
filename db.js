const mongoose = require("mongoose")
const Schema = mongoose.Schema

mongoose.connect("mongodb_connection_string?", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

const runSchema = new Schema(
  {
    startTime: String,
    startPoint: String,
    endPoint: String,
    expectedPace: String,
  },
  { timestamps: true } // automatically add createAt and updatedAt timestamps
)

const Run = mongoose.model("Run", runSchema)

module.exports = { Run }
