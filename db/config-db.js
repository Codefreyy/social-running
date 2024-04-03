;(function () {
  const db_info = {
    url: "localhost",
    username: "webuser",
    password: "socialrunning",
    port: "24667", //using lab computer may be : 24667 //27017
    database: "mongodb_data",
    collection: "runs",
    users: "users",
  }

  const moduleExports = db_info

  if (typeof __dirname != "undefined") module.exports = moduleExports
})()
