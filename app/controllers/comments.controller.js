const db = require("../config/db.config");
const dayjs = require("dayjs");

exports.getAll = (req, res) => {
  const sql = "SELECT * FROM Comments";
  db.execute(sql, (err, result) => {
    if (err) res.status(500).send(err);
    else res.status(200).send({ comments: result });
  });
};

exports.getOne = (req, res) => {
  const id = req.params.id;
  const sql = "SELECT * FROM Comments WHERE id = ?";
  db.execute(sql, [id], (err, result) => {
    if (err) res.status(500).send(err);
    else res.status(200).send({ comments: result });
  });
};

exports.getCommentsOfTask = (req, res) => {
  const task_id = req.params.task_id;
  const sql = `SELECT t.id as task_id, c.id as comment_id,  content, user_name, avatar, password, c.created_at,  c.updated_at, c.created_by,  c.updated_by, tag
  FROM Comments c
  JOIN Tasks t ON t.id = c.task_id
  JOIN Users u ON u.id = c.created_by
  WHERE t.id = ${task_id}
  ORDER BY c.created_at DESC;`;
  db.execute(sql, (err, result) => {
    if (err) res.status(500).send(err);
    else res.status(200).send({ comments: result });
  });
};

exports.create = (req, res) => {
  const body = req.body;
  const formatIsoToDateTime = (iso) => {
    const dateTime = new Date(iso);
    if (dateTime.getTime() > 0) return dayjs(dateTime).format("YYYY-MM-DD HH:mm:ss");
    return null;
  };

  const content = body.content;
  const created_at = formatIsoToDateTime(body.created_at);
  const updated_at = formatIsoToDateTime(body.updated_at);
  const task_id = body.task_id;
  const created_by = body.created_by;
  const updated_by = body.updated_by;

  const sql = `INSERT INTO Comments
        (
        content,
        created_at,
        updated_at,
        task_id,
        created_by,
        updated_by
        )
        VALUES (
         '${content}',
         '${created_at}',
         '${updated_at}',
          ${task_id},
          ${created_by},
          ${updated_by}
        );`;
  db.execute(sql, (err, results) => {
    if (err) {
      console.log(err);
      res.status(500).send(err);
    } else res.status(200).send({ message: "Created comment successfully" });
  });
};

exports.update = async (req, res) => {
  const id = req.params.id;
  const body = req.body;
  const formatIsoToDateTime = (iso) => {
    const dateTime = new Date(iso);
    if (dateTime.getTime() > 0) return dayjs(dateTime).format("YYYY-MM-DD HH:mm:ss");
    return null;
  };

  const content = body.content;
  const created_at = formatIsoToDateTime(body.created_at);
  const updated_at = formatIsoToDateTime(body.updated_at);
  const task_id = body.task_id;
  const created_by = body.created_by;
  const updated_by = body.updated_by;

  const sql = `UPDATE Comments SET
  content = '${content}',
  created_at = '${created_at}',
  updated_at = '${updated_at}',
  task_id = ${task_id},
  created_by = ${created_by},
  updated_by = ${updated_by},
  WHERE id = ${id} ;`;
  db.query(sql, (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).send(err);
    } else res.status(200).send({ message: "updated successfully", result: result });
  });
};

exports.delete = (req, res) => {
  const id = req.params.id;
  const sql = `DELETE FROM Comments WHERE id = ${id}`;
  db.query(sql, (err, result) => {
    if (err) res.status(500).send(err);
    else res.status(200).send({ message: "deleted successfully", result: result });
  });
};
