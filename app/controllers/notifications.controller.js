const db = require("../config/db.config");
const dayjs = require("dayjs");

exports.getAll = (req, res) => {
  const sql = "SELECT * FROM Notifications";
  db.execute(sql, (err, result) => {
    if (err) res.status(500).send(err);
    else res.status(200).send({ notifications: result });
  });
};

exports.getOne = (req, res) => {
  const id = req.params.id;
  const sql = "SELECT * FROM Notifications WHERE id = ?";
  db.execute(sql, [id], (err, result) => {
    if (err) res.status(500).send(err);
    else res.status(200).send({ notifications: result });
  });
};

exports.getNotificationsOfUser = (req, res) => {
  const user_id = req.params.user_id;
  const sql = `SELECT n.id , title, content, from_user, to_user, created_at, updated_at, notification_type_id,
  task_id, checked, type, user_name, avatar, email, password
  FROM Notifications n
  JOIN Notification_Types nt ON n.notification_type_id = nt.id
  JOIN Users u ON u.id = n.from_user
  WHERE to_user = ${user_id}
  ORDER BY created_at DESC;`;
  db.execute(sql, (err, result) => {
    if (err) res.status(500).send(err);
    else res.status(200).send({ notifications: result });
  });
};

exports.create = (req, res) => {
  const body = req.body;
  const formatIsoToDateTime = (iso) => {
    const dateTime = new Date(iso);
    if (dateTime.getTime() > 0) return dayjs(dateTime).format("YYYY-MM-DD HH:mm:ss");
    return null;
  };

  const title = body.title;
  const content = body.content;
  const from_user = body.from_user;
  const to_user = body.to_user;
  const created_at = formatIsoToDateTime(body.created_at);
  const updated_at = formatIsoToDateTime(body.updated_at);
  const notification_type_id = body.notification_type_id;
  const task_id = body.task_id;

  const sql = `INSERT INTO Notifications
        (
        title,
        content,
        from_user,
        to_user,
        created_at,
        updated_at,
        notification_type_id,
        task_id
        )
        VALUES (
         '${title}',
         '${content}',
          ${from_user},
          ${to_user},
         '${created_at}',
         '${updated_at}',
          ${notification_type_id},
          ${task_id}
        );`;
  db.execute(sql, (err, results) => {
    if (err) {
      console.log(err);
      res.status(500).send(err);
    } else res.status(200).send({ message: "Created notification successfully" });
  });
};

exports.update = (req, res) => {
  const id = req.params.id;
  const body = req.body;
  const formatIsoToDateTime = (iso) => {
    const dateTime = new Date(iso);
    if (dateTime.getTime() > 0) return dayjs(dateTime).format("YYYY-MM-DD HH:mm:ss");
    return null;
  };

  const title = body.title;
  const content = body.content;
  const from_user = body.from_user;
  const to_user = body.to_user;
  const created_at = formatIsoToDateTime(body.created_at);
  const updated_at = formatIsoToDateTime(body.updated_at);
  const notification_type_id = body.notification_type_id;
  const task_id = body.task_id;
  const checked = body.checked;

  const sql = `UPDATE Notifications SET
  title = '${title}',
  content = '${content}',
  from_user = ${from_user},
  to_user = ${to_user},
  created_at = '${created_at}',
  updated_at = '${updated_at}',
  notification_type_id = ${notification_type_id},
  task_id = ${task_id},
  checked = ${checked}
  WHERE id = ${id} ;`;
  db.execute(sql, (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).send(err);
    } else res.status(200).send({ message: "updated notification successfully", result: result });
  });
};

exports.delete = (req, res) => {
  const id = req.params.id;
  const sql = `DELETE FROM Notifications WHERE id = ${id}`;
  db.execute(sql, (err, result) => {
    if (err) res.status(500).send(err);
    else res.status(200).send({ message: "deleted successfully", result: result });
  });
};
