const mysql = require("mysql2");
const db = mysql.createConnection({
  user: "root",
  host: "localhost",
  password: "password",
  database: "TaskManagement",
});

module.exports = db;
