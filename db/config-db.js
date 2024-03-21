;(function () {
  const db_info = {
    url: "localhost",
    username: "webuser",
    password: "socialrunninggroup3abc",
    port: "24755",
    database: "mongodb_data",
    collection: "runs",
    users: "users",
  }

  const moduleExports = db_info

  if (typeof __dirname != "undefined") module.exports = moduleExports
})()
