const db = require("../config/db.config");

exports.getAll = (req, res) => {
  const sql = "SELECT * FROM TaskTypes";
  db.query(sql, (err, result) => {
    if (err) res.status(500).send(err);
    else res.status(200).send({ task_types: result });
  });
};
