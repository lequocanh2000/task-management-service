const db = require("../config/db.config");

const convertUndefined = (value) => {
  if (value) {
    if (value == "undefined") return undefined;
    else return value;
  }
  return undefined;
};

exports.getAll = async (req, res) => {
  const body = req.query;
  const userId = convertUndefined(body.user_id);
  const departmentId = convertUndefined(body.department_id);

  let taskListSql = `SELECT t.id, task_name, descriptions, assignee, parent_id, task_status, task_type_id, point, created_by, updated_by, department_id
  reated_at, updated_at, due_date, end_date, complete_date, failed, completed, paused
  FROM  Tasks t JOIN Users u ON t.created_by = u.id
  WHERE completed = 0
  ;`;
  let tasksTodoSql = `SELECT t.id, task_name, descriptions, assignee, parent_id, task_status, task_type_id, point, created_by, updated_by, department_id
  reated_at, updated_at, due_date, end_date, complete_date, failed, completed, paused
  FROM  Tasks t JOIN Users u ON t.created_by = u.id
  WHERE completed = 0 AND task_status = 'todo'
  ;`;
  let tasksInprogressSql = `SELECT t.id, task_name, descriptions, assignee, parent_id, task_status, task_type_id, point, created_by, updated_by, department_id
  reated_at, updated_at, due_date, end_date, complete_date, failed, completed, paused
  FROM  Tasks t JOIN Users u ON t.created_by = u.id
  WHERE completed = 0 AND task_status = 'inprogress'
  ;`;
  let tasksDoneSql = `SELECT t.id, task_name, descriptions, assignee, parent_id, task_status, task_type_id, point, created_by, updated_by, department_id
  reated_at, updated_at, due_date, end_date, complete_date, failed, completed, paused
  FROM  Tasks t JOIN Users u ON t.created_by = u.id
  WHERE completed = 0 AND task_status = 'done'
  ;`;
  let tasksFailedSql = `SELECT t.id, task_name, descriptions, assignee, parent_id, task_status, task_type_id, point, created_by, updated_by, department_id
  reated_at, updated_at, due_date, end_date, complete_date, failed, completed, paused
  FROM  Tasks t JOIN Users u ON t.created_by = u.id
  WHERE completed = 0 AND failed = 1
  ;`;
  let numberTaskCompletedSql = `SELECT COUNT(*) AS number_tasks_completed
  FROM tasks
  WHERE completed = 1 AND failed = 0 AND paused = 0 AND YEAR(created_at) = '2022'
  ;`;
  let numberTaskFailedSql = `SELECT COUNT(*) AS number_tasks_failed
  FROM tasks
  WHERE completed = 1 AND failed = 1 AND paused = 0 AND year(created_at) = '2022'
  ;`;

  if (userId && departmentId) {
    taskListSql = `SELECT * FROM
    (
      (
        SELECT t.id, task_name, descriptions, assignee, parent_id, task_status, task_type_id, point, created_by, updated_by, department_id
        reated_at, updated_at, due_date, end_date, complete_date, failed, completed, paused
        FROM  Tasks t JOIN Users u ON t.created_by = u.id
        WHERE completed = 0 AND department_id = ${departmentId}
      )
    UNION
      (
        SELECT t.id, task_name, descriptions, assignee, parent_id, task_status, task_type_id, point, created_by, updated_by, department_id
        created_at, updated_at, due_date, end_date, complete_date, failed, completed, paused
        FROM  Tasks t JOIN Users u ON t.created_by = u.id
        WHERE completed = 0 AND created_by = ${userId}
      )
    ) AS list_task
    ;`;

    tasksTodoSql = `SELECT * FROM
    (
      (
        SELECT t.id, task_name, descriptions, assignee, parent_id, task_status, task_type_id, point, created_by, updated_by, department_id
        reated_at, updated_at, due_date, end_date, complete_date, failed, completed, paused
        FROM  Tasks t JOIN Users u ON t.created_by = u.id
        WHERE completed = 0 AND department_id = ${departmentId} AND task_status = 'todo'
      )
    UNION
      (
        SELECT t.id, task_name, descriptions, assignee, parent_id, task_status, task_type_id, point, created_by, updated_by, department_id
        created_at, updated_at, due_date, end_date, complete_date, failed, completed, paused
        FROM  Tasks t JOIN Users u ON t.created_by = u.id
        WHERE completed = 0 AND created_by = ${userId} AND task_status = 'todo'
      )
    ) AS list_task_todo
    ;`;

    tasksInprogressSql = `SELECT * FROM
    (
      (
        SELECT t.id, task_name, descriptions, assignee, parent_id, task_status, task_type_id, point, created_by, updated_by, department_id
        reated_at, updated_at, due_date, end_date, complete_date, failed, completed, paused
        FROM  Tasks t JOIN Users u ON t.created_by = u.id
        WHERE completed = 0 AND department_id = ${departmentId} AND task_status = 'inprogress'
      )
    UNION
      (
        SELECT t.id, task_name, descriptions, assignee, parent_id, task_status, task_type_id, point, created_by, updated_by, department_id
        created_at, updated_at, due_date, end_date, complete_date, failed, completed, paused
        FROM  Tasks t JOIN Users u ON t.created_by = u.id
        WHERE completed = 0 AND created_by = ${userId} AND task_status = 'inprogress'
      )
    ) AS list_task_inprogress
    ;`;

    tasksDoneSql = `SELECT * FROM
    (
      (
        SELECT t.id, task_name, descriptions, assignee, parent_id, task_status, task_type_id, point, created_by, updated_by, department_id
        reated_at, updated_at, due_date, end_date, complete_date, failed, completed, paused
        FROM  Tasks t JOIN Users u ON t.created_by = u.id
        WHERE completed = 0 AND department_id = ${departmentId} AND task_status = 'done'
      )
    UNION
      (
        SELECT t.id, task_name, descriptions, assignee, parent_id, task_status, task_type_id, point, created_by, updated_by, department_id
        created_at, updated_at, due_date, end_date, complete_date, failed, completed, paused
        FROM  Tasks t JOIN Users u ON t.created_by = u.id
        WHERE completed = 0 AND created_by = ${userId} AND task_status = 'done'
      )
    ) AS list_task_done
    ;`;

    tasksFailedSql = `SELECT * FROM
    (
      (
        SELECT t.id, task_name, descriptions, assignee, parent_id, task_status, task_type_id, point, created_by, updated_by, department_id
        reated_at, updated_at, due_date, end_date, complete_date, failed, completed, paused
        FROM  Tasks t JOIN Users u ON t.created_by = u.id
        WHERE completed = 0 AND failed = 1 AND department_id = ${departmentId}
      )
    UNION
      (
        SELECT t.id, task_name, descriptions, assignee, parent_id, task_status, task_type_id, point, created_by, updated_by, department_id
        created_at, updated_at, due_date, end_date, complete_date, failed, completed, paused
        FROM  Tasks t JOIN Users u ON t.created_by = u.id
        WHERE completed = 0 AND failed = 1 AND created_by = ${userId}
      )
    ) AS list_task_done
    ;`;

    numberTaskCompletedSql = `SELECT COUNT(*) AS number_tasks_completed
    FROM tasks
    WHERE completed = 1 AND failed = 0 AND paused = 0 AND year(created_at) = '2022' AND created_by = ${userId}
    ;`;
    numberTaskFailedSql = `SELECT COUNT(*) AS number_tasks_failed
    FROM tasks
    WHERE completed = 1 AND failed = 1 AND paused = 0 AND year(created_at) = '2022' AND created_by = ${userId}
    ;`;
  }

  if (userId) {
    taskListSql = `SELECT t.id, task_name, descriptions, assignee, parent_id, task_status, task_type_id, point, created_by, updated_by, department_id
      reated_at, updated_at, due_date, end_date, complete_date, failed, completed, paused
      FROM  Tasks t JOIN Users u ON t.created_by = u.id
      WHERE completed = 0 AND assignee = ${userId}
      ;`;
    tasksTodoSql = `SELECT t.id, task_name, descriptions, assignee, parent_id, task_status, task_type_id, point, created_by, updated_by, department_id
      reated_at, updated_at, due_date, end_date, complete_date, failed, completed, paused
      FROM  Tasks t JOIN Users u ON t.created_by = u.id
      WHERE completed = 0 AND assignee = ${userId} AND task_status = 'todo'
      ;`;
    tasksInprogressSql = `SELECT t.id, task_name, descriptions, assignee, parent_id, task_status, task_type_id, point, created_by, updated_by, department_id
      reated_at, updated_at, due_date, end_date, complete_date, failed, completed, paused
      FROM  Tasks t JOIN Users u ON t.created_by = u.id
      WHERE completed = 0 AND assignee = ${userId} AND task_status = 'inprogress'
      ;`;
    tasksDoneSql = `SELECT t.id, task_name, descriptions, assignee, parent_id, task_status, task_type_id, point, created_by, updated_by, department_id
      reated_at, updated_at, due_date, end_date, complete_date, failed, completed, paused
      FROM  Tasks t JOIN Users u ON t.created_by = u.id
      WHERE completed = 0 AND assignee = ${userId} AND task_status = 'done'
      ;`;
    tasksFailedSql = `SELECT t.id, task_name, descriptions, assignee, parent_id, task_status, task_type_id, point, created_by, updated_by, department_id
      reated_at, updated_at, due_date, end_date, complete_date, failed, completed, paused
      FROM  Tasks t JOIN Users u ON t.created_by = u.id
      WHERE completed = 0 AND failed = 1 AND assignee = ${userId}
      ;`;
    numberTaskCompletedSql = `SELECT COUNT(*) AS number_tasks_completed
      FROM tasks
      WHERE completed = 1 AND failed = 0 AND paused = 0 AND year(created_at) = '2022' AND assignee = ${userId}
      ;`;
    numberTaskFailedSql = `SELECT COUNT(*) AS number_tasks_failed
      FROM tasks
      WHERE completed = 1 AND failed = 1 AND paused = 0 AND year(created_at) = '2022' AND assignee = ${userId}
      ;`;
  }

  const getTaskList = (sql) =>
    new Promise((resolve, rejects) => {
      db.execute(sql, (error, results) => {
        if (error) rejects(error);
        else resolve(results);
      });
    });

  const getTaskListTodo = (sql) =>
    new Promise((resolve, rejects) => {
      db.execute(sql, (error, results) => {
        if (error) rejects(error);
        else resolve(results);
      });
    });

  const getTaskListInprogress = (sql) =>
    new Promise((resolve, rejects) => {
      db.execute(sql, (error, results) => {
        if (error) rejects(error);
        else resolve(results);
      });
    });

  const getTaskListDone = (sql) =>
    new Promise((resolve, rejects) => {
      db.execute(sql, (error, results) => {
        if (error) rejects(error);
        else resolve(results);
      });
    });

  const getTaskListFailed = (sql) =>
    new Promise((resolve, rejects) => {
      db.execute(sql, (error, results) => {
        if (error) rejects(error);
        else resolve(results);
      });
    });

  const getNumberTaskCompleted = (sql) =>
    new Promise((resolve, rejects) => {
      db.execute(sql, (error, results) => {
        if (error) rejects(error);
        else resolve(results);
      });
    });

  const getNumberTaskFailed = (sql) =>
    new Promise((resolve, rejects) => {
      db.execute(sql, (error, results) => {
        if (error) rejects(error);
        else resolve(results);
      });
    });

  const getMembers = () =>
    new Promise((resolve, rejects) => {
      const sql = `SELECT u.id as id, user_name, avatar, email, password, position_id, department_id, position_name, department_name FROM Users u
      JOIN Positions p ON u.position_id = p.id
      JOIN Departments d ON u.department_id = d.id
      WHERE position_id <> 1
      ;`;
      db.execute(sql, (error, results) => {
        if (error) rejects(error);
        else resolve(results);
      });
    });

  try {
    const taskList = await getTaskList(taskListSql);
    const taskListTodo = await getTaskListTodo(tasksTodoSql);
    const taskInprogress = await getTaskListInprogress(tasksInprogressSql);
    const taskListDone = await getTaskListDone(tasksDoneSql);
    const taskListFailed = await getTaskListFailed(tasksFailedSql);
    const numberTaskCompleted = await getNumberTaskCompleted(numberTaskCompletedSql);
    const numberTaskFailed = await getNumberTaskFailed(numberTaskFailedSql);

    const members = await getMembers();

    res.status(200).send({
      overviews: {
        tasks: taskList,
        task_todos: taskListTodo,
        task_inprogress: taskInprogress,
        task_dones: taskListDone,
        task_faileds: taskListFailed,
        members,
        number_tasks_completed: numberTaskCompleted[0].number_tasks_completed,
        number_tasks_failed: numberTaskFailed[0].number_tasks_failed,
      },
    });
  } catch (error) {
    res.status(500).send(error);
  }
};
