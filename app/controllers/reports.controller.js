const db = require("../config/db.config");

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const handleReports = (taskCompleteds, taskFaileds) => {
  const reports = [];
  months.forEach((month) => {
    const taskCompleted = taskCompleteds.find((taskCompleted) => taskCompleted.month == month);
    const taskFailed = taskFaileds.find((taskFailed) => taskFailed.month == month);
    if (taskCompleted && taskFailed) {
      reports.push({
        month,
        task_completed: taskCompleted.task_completed,
        task_failed: taskFailed.task_failed,
      });
      return;
    }
    if (taskCompleted && !taskFailed) {
      reports.push({
        month,
        task_completed: taskCompleted.task_completed,
        task_failed: 0,
      });
      return;
    }

    if (!taskCompleted && taskFailed) {
      reports.push({
        month,
        task_completed: 0,
        task_failed: taskFailed.task_failed,
      });
      return;
    }

    if (!taskCompleted && !taskFailed) {
      reports.push({
        month,
        task_completed: 0,
        task_failed: 0,
      });
      return;
    }
  });
  return reports;
};

exports.getAll = async (req, res) => {
  const body = req.query;
  const year = body.year;
  const userId = body.userId;

  const getTaskCompleteds = (year, userId) =>
    new Promise((resolve, rejects) => {
      const sql = `SELECT MONTHNAME(created_at) AS month, YEAR(created_at) AS year, u.id AS user_id,COUNT(t.id) AS task_completed FROM Tasks t JOIN Users u ON t.assignee = u.id
      WHERE completed = 1 and failed = 0
      GROUP BY month, year , u.id
      HAVING year = '${year}' and u.id = ${userId}
      ORDER BY MONTH(created_at) ASC
      ;`;
      db.execute(sql, (error, results) => {
        if (error) rejects(error);
        else resolve(results);
      });
    });

  const getTaskFaileds = (year, userId) =>
    new Promise((resolve, rejects) => {
      const sql = `SELECT MONTHNAME(created_at) AS month, YEAR(created_at) AS year, u.id AS user_id,COUNT(t.id) AS task_failed FROM Tasks t JOIN Users u ON t.assignee = u.id
      WHERE completed = 1 and failed = 1
      GROUP BY month, year , u.id
      HAVING year = '${year}' and u.id = ${userId}
      ORDER BY MONTH(created_at) ASC
      ;`;
      db.execute(sql, (error, results) => {
        if (error) rejects(error);
        else resolve(results);
      });
    });

  const getTasks = (year, userId) =>
    new Promise((resolve, rejects) => {
      const sql = `SELECT t.id, task_name, descriptions, assignee, parent_id, task_status, task_type_id, point, created_by, updated_by,
      created_at, updated_at, due_date, end_date, complete_date, failed, completed, u.id AS user_id, user_name, avatar, email,
      password, position_id, department_id
      FROM  Tasks t JOIN Users u ON t.assignee = u.id
      WHERE t.assignee = ${userId} and year(created_at) = '${year}' and completed = 1
      ;`;
      db.execute(sql, (error, results) => {
        if (error) rejects(error);
        else resolve(results);
      });
    });

  try {
    const taskCompleteds = await getTaskCompleteds(year, userId);
    const taskFaileds = await getTaskFaileds(year, userId);
    const tasks = await getTasks(year, userId);
    const reports = handleReports(taskCompleteds, taskFaileds);

    res.status(200).send({
      reports,
      tasks,
    });
  } catch (error) {
    res.status(500).send(error);
  }
};

exports.getReportsByPosition = async (req, res) => {
  const body = req.query;
  const year = body.year;
  const userId = body.userId;

  const getTotalTaskCompleteds = (year, userId) =>
    new Promise((resolve, rejects) => {
      const sql = `SELECT MONTHNAME(created_at) AS month, YEAR(created_at) AS year, u.id AS user_id,COUNT(t.id) AS task_completed FROM Tasks t JOIN Users u ON t.assignee = u.id
      WHERE completed = 1 and failed = 0
      GROUP BY month, year , u.id
      HAVING year = '${year}' and u.id = ${userId}
      ORDER BY MONTH(created_at) ASC
      ;`;
      db.execute(sql, (error, results) => {
        if (error) rejects(error);
        else resolve(results);
      });
    });

  const getTotalTaskFaileds = (year, userId) =>
    new Promise((resolve, rejects) => {
      const sql = `SELECT MONTHNAME(created_at) AS month, YEAR(created_at) AS year, u.id AS user_id,COUNT(t.id) AS task_failed FROM Tasks t JOIN Users u ON t.assignee = u.id
      WHERE completed = 1 and failed = 1
      GROUP BY month, year , u.id
      HAVING year = '${year}' and u.id = ${userId}
      ORDER BY MONTH(created_at) ASC
      ;`;
      db.execute(sql, (error, results) => {
        if (error) rejects(error);
        else resolve(results);
      });
    });

  const getTasks = (year, userId) =>
    new Promise((resolve, rejects) => {
      const sql = `SELECT t.id, task_name, descriptions, assignee, parent_id, task_status, task_type_id, point, created_by, updated_by,
      created_at, updated_at, due_date, end_date, complete_date, failed, completed, u.id AS user_id, user_name, avatar, email,
      password, position_id, department_id
      FROM  Tasks t JOIN Users u ON t.assignee = u.id
      WHERE t.assignee = ${userId} and year(created_at) = '${year}' and completed = 1
      ;`;
      db.execute(sql, (error, results) => {
        if (error) rejects(error);
        else resolve(results);
      });
    });

  try {
    const taskCompleteds = await getTotalTaskCompleteds(year, userId);
    const taskFaileds = await getTotalTaskFaileds(year, userId);
    const tasks = await getTasks(year, userId);

    res.status(200).send({
      reports: {
        task_completeds: taskCompleteds,
        task_faileds: taskFaileds,
        tasks,
      },
    });
  } catch (error) {
    res.status(500).send(error);
  }
};

const convertUndefined = (value) => {
  if (value) {
    if (value == "undefined") return undefined;
    else return value;
  }
  return undefined;
};

exports.getReportUsers = async (req, res) => {
  const body = req.query;
  const year = body.year;
  const departmentIdUser = convertUndefined(body.department_id);
  const userId = convertUndefined(body.user_id);

  let sql = `SELECT distinct u.id as id, user_name, avatar, email, password, position_id, department_id, department_name
  FROM Users u
  JOIN Tasks t ON t.assignee = u.id
  JOIN Departments d ON d.id = u.department_id
  WHERE year(created_at) = '${year}' AND position_id <> 1
  ORDER BY department_id ASC`;

  if (userId && departmentIdUser) {
    sql = `(
      SELECT distinct u.id as id, user_name, avatar, email, password, position_id, department_id, department_name
      FROM Users u
      JOIN Tasks t ON t.assignee = u.id
      JOIN Departments d ON d.id = u.department_id
      WHERE year(created_at) = '${year}' AND created_by = ${userId}
      ORDER BY department_id ASC
    )
      UNION
    (
      SELECT distinct u.id as id, user_name, avatar, email, password, position_id, department_id, department_name
      FROM Users u
      JOIN Tasks t ON t.assignee = u.id
      JOIN Departments d ON d.id = u.department_id
      WHERE year(created_at) = '${year}' AND department_id = ${departmentIdUser} AND position_id <> 1 AND position_id <> 2
      ORDER BY department_id ASC
    )`;
  }

  const getDepartments = () =>
    new Promise((resolve, rejects) => {
      const sql = `SELECT * FROM Departments;`;
      db.execute(sql, (error, results) => {
        if (error) rejects(error);
        else resolve(results);
      });
    });

  const getUsersByDepartmentId = (sql, departmentId) =>
    new Promise((resolve, rejects) => {
      let sqlByDeparment = `SELECT * FROM (
          ${sql}
        ) as users_departments
        WHERE department_id = ${departmentId}
        ORDER BY id ASC;`;
      db.execute(sqlByDeparment, (error, results) => {
        if (error) rejects(error);
        else resolve(results);
      });
    });

  try {
    const departmentsUsers = [];
    const departments = await getDepartments();
    for (const department of departments) {
      const usersByDepartmentId = await getUsersByDepartmentId(sql, department.id);
      if (!usersByDepartmentId.length) continue;
      departmentsUsers.push({
        department_id: department.id,
        department_name: department.department_name,
        users: usersByDepartmentId,
      });
    }
    res.status(200).send({ departments_users: departmentsUsers });
  } catch (error) {
    res.status(500).send(error);
  }
};
