;(function () {
  const db_info = {
    url: "localhost",
    username: "webuser",
    password: "yx65yx65",
    port: "27017",
    database: "mongodb_data",
    collection: "runs",
    users: "users",
  }

  const moduleExports = db_info

  if (typeof __dirname != "undefined") module.exports = moduleExports
})()
