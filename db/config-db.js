;(function () {
  const db_info = {
    url: "localhost",
    username: "webuser",
    password: "socialrunning",
    port: "27017", //etienne : 24667, //27017
    database: "mongodb_data",
    collection: "runs",
    users: "users",
  }

  const moduleExports = db_info

  if (typeof __dirname != "undefined") module.exports = moduleExports
})()
