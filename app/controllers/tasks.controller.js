const db = require("../config/db.config");
const util = require("util");
const dayjs = require("dayjs");

exports.getAll = (req, res) => {
  const task_type_id = req.query.task_type_id;
  if (task_type_id) {
    const sql = `SELECT * FROM Tasks WHERE task_type_id = ${task_type_id}`;
    db.query(sql, (err, result) => {
      if (err) res.status(500).send(err);
      else res.status(200).send({ tasks: result });
    });
  } else {
    const sql = "SELECT * FROM Tasks";
    db.query(sql, (err, result) => {
      if (err) res.status(500).send(err);
      else res.status(200).send({ tasks: result });
    });
  }
};

exports.getAllTasksHaveSubs = async (req, res) => {
  const getTasks = () =>
    new Promise((resolve, rejects) => {
      const sql = `SELECT * FROM Tasks WHERE task_type_id = 1 AND paused = 0`;
      db.execute(sql, (error, results) => {
        if (error) rejects(error);
        else resolve(results);
      });
    });
  const getSubTasks = (id) =>
    new Promise((resolve, rejects) => {
      const sql = `SELECT * FROM Tasks WHERE parent_id = ${id} AND paused = 0`;
      db.execute(sql, (error, results) => {
        if (error) rejects(error);
        else resolve(results);
      });
    });

  try {
    const tasksHaveSub = [];
    const tasks = await getTasks();
    for (const task of tasks) {
      const subTask = await getSubTasks(task.id);
      tasksHaveSub.push({
        ...task,
        sub_tasks: subTask,
      });
    }
    res.send({ tasks: tasksHaveSub });
  } catch (error) {
    console.log(error);
  }
};

exports.getAllSubsOfTask = (req, res) => {
  const id = req.params.id;
  const sql = `SELECT * FROM Tasks WHERE parent_id = ${id}`;
  db.execute(sql, (err, results) => {
    if (err) {
      console.log(err);
      res.status(500).send(err);
    } else res.status(200).send({ sub_tasks: results });
  });
};

exports.getOne = (req, res) => {
  const id = req.params.id;
  const sql = "SELECT * FROM Tasks WHERE id = ?";
  db.query(sql, id, (err, result) => {
    if (err) res.status(500).send(err);
    else res.status(200).send({ tasks: result });
  });
};

exports.create = (req, res) => {
  const body = req.body;
  console.log(body);
  const formatIsoToDateTime = (iso) => {
    const dateTime = new Date(iso);
    if (dateTime.getTime() > 0) return dayjs(dateTime).format("YYYY-MM-DD HH:mm:ss");
    return null;
  };

  const task_name = body.task_name;
  const symbol_name = body.symbol_name;
  const task_type_id = body.task_type_id;
  const created_by = body.created_by;
  const updated_by = body.updated_by;
  const parent_id = body.parent_id;
  const created_at = formatIsoToDateTime(body.created_at);
  const updated_at = formatIsoToDateTime(body.updated_at);

  console.log(symbol_name);
  const sql = `INSERT INTO Tasks
  (
    task_name,
    symbol_name,
    task_type_id,
    created_by,
    updated_by,
    parent_id,
    created_at,
    updated_at)
  VALUES (
   '${task_name}',
   '${symbol_name}',
    ${task_type_id},
    ${created_by},
    ${updated_by},
    ${parent_id},
   '${created_at}',
   '${updated_at}'
  )`;
  console.log(sql);
  db.query(sql, (err, result) => {
    if (err) res.status(500).send(err);
    else res.status(200).send({ message: result });
  });
};

exports.update = (req, res) => {
  const id = req.params.id;
  const body = req.body;
  console.log(body);
  const formatIsoToDateTime = (iso) => {
    const dateTime = new Date(iso);
    if (dateTime.getTime() > 0) return dayjs(dateTime).format("YYYY-MM-DD HH:mm:ss");
    return null;
  };

  const task_name = body.task_name;
  const descriptions = body.descriptions;
  const assignee = body.assignee;
  const parent_id = body.parent_id;
  const task_status = body.task_status;
  const task_type_id = body.task_type_id;
  const point = body.point;
  const created_by = body.created_by;
  const updated_by = body.updated_by;
  const created_at = formatIsoToDateTime(body.created_at);
  const updated_at = formatIsoToDateTime(body.updated_at);
  const due_date = formatIsoToDateTime(body.due_date);
  const end_date = formatIsoToDateTime(body.end_date);
  const complete_date = formatIsoToDateTime(body.complete_date);
  const failed = body.failed;
  const completed = body.completed;
  const paused = body.paused;
  const sql = `UPDATE Tasks SET
  task_name = '${task_name}',
  descriptions = '${descriptions}',
  assignee = ${assignee},
  parent_id = ${parent_id},
  task_status = '${task_status}',
  task_type_id = ${task_type_id},
  point = ${point},
  created_by = ${created_by},
  updated_by = ${updated_by},
  created_at = '${created_at}',
  updated_at =  '${updated_at}',
  due_date = ${due_date == null ? null : `'${due_date}'`},
  end_date = ${end_date == null ? null : `'${end_date}'`},
  complete_date = ${complete_date == null ? null : `'${complete_date}'`},
  failed = ${failed},
  completed = ${completed},
  paused = ${paused}
  WHERE id = ${id} ;`;
  console.log(sql);
  db.query(sql, (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).send(err);
    } else res.status(200).send({ message: "updated successfully", result: result });
  });
};

exports.updateFailed = async (req, res) => {
  const getTasks = () =>
    new Promise((resolve, rejects) => {
      const sql = `SELECT * FROM Tasks WHERE due_date < current_date() AND completed = 0 AND paused = 0 AND failed = 0`;
      console.log(sql);
      db.execute(sql, (error, results) => {
        if (error) rejects(error);
        else resolve(results);
      });
    });
  const updateFailedTask = (id) =>
    new Promise((resolve, rejects) => {
      const sql = `UPDATE Tasks SET failed = 1 WHERE id = ${id}`;
      console.log(sql);
      db.execute(sql, (error, results) => {
        if (error) rejects(error);
        else resolve(results);
      });
    });

  try {
    const tasks = await getTasks();
    // console.log(tasks);
    for (const task of tasks) {
      await updateFailedTask(task.id);
    }
    res.status(200).send({ tasks, message: "successfully" });
  } catch (error) {
    res.status(500).send(error);
  }
};

exports.updatePaused = async (req, res) => {
  const id = req.params.id;
  const body = req.body;
  const paused = body.paused;

  const getSubTasks = (id) =>
    new Promise((resolve, rejects) => {
      const sql = `SELECT * FROM Tasks WHERE parent_id = ${id}`;
      db.execute(sql, (error, results) => {
        if (error) rejects(error);
        else resolve(results);
      });
    });
  const updatePausedTask = (id, paused) =>
    new Promise((resolve, rejects) => {
      const sql = `UPDATE Tasks SET paused = ${paused} WHERE id = ${id}`;
      db.execute(sql, (error, results) => {
        if (error) rejects(error);
        else resolve(results);
      });
    });

  try {
    const subTasks = await getSubTasks(id);
    if (subTasks.length) {
      await updatePausedTask(id, paused);
      for (const sub of subTasks) {
        await updatePausedTask(sub.id, paused);
      }
      res.status(200).send({ message: paused ? "task paused" : "task has continued" });
      return;
    }
    if (!subTasks.length) {
      await updatePausedTask(id, paused);
      res.status(200).send({ message: paused ? "task paused" : "task has continued" });
      return;
    }
  } catch (error) {
    res.status(500).send(error);
  }
};

exports.delete = async (req, res) => {
  const id = req.params.id;
  const getSubTasks = (id) =>
    new Promise((resolve, rejects) => {
      const sql = `SELECT * FROM Tasks WHERE parent_id = ${id}`;
      db.execute(sql, (error, results) => {
        if (error) rejects(error);
        else resolve(results);
      });
    });
  const deleteTask = (id) =>
    new Promise((resolve, rejects) => {
      const sql = `DELETE FROM Tasks WHERE id = ${id}`;
      db.execute(sql, (error, results) => {
        if (error) rejects(error);
        else resolve(results);
      });
    });

  try {
    const subTasks = await getSubTasks(id);
    await deleteTask(id);
    for (const sub of subTasks) {
      await deleteTask(sub.id);
    }
    res.status(200).send({ message: "deleted successfully" });
  } catch (error) {
    res.status(500).send(error);
  }
};

//get document and comment of task
exports.getDocumentTotalAndCommentTotalOfTask = async (req, res) => {
  const body = req.query;
  const taskId = body.task_id;
  const getDocumentTotal = (taskId) =>
    new Promise((resolve, rejects) => {
      const sql = `SELECT COUNT(*) as document_total
      FROM Tasks t
      JOIN Documents d ON t.id = d.task_id
      JOIN Document_details dd ON dd.document_id = d.id
      WHERE t.id = ${taskId}
      ;`;
      db.execute(sql, (error, results) => {
        if (error) rejects(error);
        else resolve(results);
      });
    });

  const getCommnetTotal = (taskId) =>
    new Promise((resolve, rejects) => {
      let sql = `SELECT COUNT(*) as comment_total FROM
      Tasks t
      JOIN Comments c ON t.id = c.task_id
      WHERE t.id = ${taskId}
      ;`;
      db.execute(sql, (error, results) => {
        if (error) rejects(error);
        else resolve(results);
      });
    });

  try {
    const documentTotal = await getDocumentTotal(taskId);
    const commnetTotal = await getCommnetTotal(taskId);

    res.status(200).send({
      document_total: documentTotal[0].document_total,
      commnet_total: commnetTotal[0].comment_total,
    });
  } catch (error) {
    res.status(500).send(error);
  }
};
