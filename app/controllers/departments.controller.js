const db = require("../config/db.config");

exports.getAll = (req, res) => {
  const sql = "SELECT * FROM Departments";
  db.execute(sql, (err, result) => {
    if (err) res.status(500).send(err);
    else res.status(200).send({ departments: result });
  });
};
