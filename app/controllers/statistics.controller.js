const db = require("../config/db.config");

exports.getAll = async (req, res) => {
  const body = req.query;
  const year = body.year;

  const getCommitmentPoint = (year) =>
    new Promise((resolve, rejects) => {
      const sql = `SELECT MONTHNAME(created_at) AS month, YEAR(created_at) AS year, SUM(point) AS commitment_point
      FROM Tasks t
      GROUP BY month, year
      HAVING year = '${year}'
      ORDER BY MONTH(created_at) ASC`;
      db.execute(sql, (error, results) => {
        if (error) rejects(error);
        else resolve(results);
      });
    });

  const getCompletePoint = (year) =>
    new Promise((resolve, rejects) => {
      const sql = `SELECT MONTHNAME(created_at) AS month, YEAR(created_at) AS year, SUM(point) AS complete_point
      FROM Tasks t
      WHERE completed = 1 AND failed = 0
      GROUP BY month, year
      HAVING year = '${year}'
      ORDER BY MONTH(created_at) ASC`;
      db.execute(sql, (error, results) => {
        if (error) rejects(error);
        else resolve(results);
      });
    });

  const getIncompletePoint = (year) =>
    new Promise((resolve, rejects) => {
      const sql = `SELECT MONTHNAME(created_at) AS month, YEAR(created_at) AS year, SUM(point) AS incomplete_point
      FROM Tasks t
      WHERE completed = 1 AND failed = 1
      GROUP BY month, year
      HAVING year = '${year}'
      ORDER BY MONTH(created_at) ASC`;
      db.execute(sql, (error, results) => {
        if (error) rejects(error);
        else resolve(results);
      });
    });

  try {
    const commitmentPoint = await getCommitmentPoint(year);
    const completePoint = await getCompletePoint(year);
    const inCompletePoint = await getIncompletePoint(year);
    res.status(200).send({
      statistics: {
        commitment_point: commitmentPoint,
        complete_point: completePoint,
        incomplete_point: inCompletePoint,
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

exports.getStatisticsByUsers = async (req, res) => {
  const body = req.query;
  const year = body.year;
  const departmentId = convertUndefined(body.department_id);
  const createdBy = convertUndefined(body.created_by);

  let sqlUsers = `SELECT DISTINCT u.id, user_name, avatar, department_name
  FROM tasks t
  JOIN Users u ON t.assignee = u.id
  JOIN Departments d ON d.id = u.department_id
  WHERE YEAR(created_at) = '${year}' AND assignee <> 0
  ORDER BY d.id ASC ;`;

  let sqlOnlyUserIds = `SELECT DISTINCT u.id
  FROM tasks t
  JOIN Users u ON t.assignee = u.id
  JOIN Departments d ON d.id = u.department_id
  WHERE YEAR(created_at) = '${year}' AND assignee <> 0
  ORDER BY d.id ASC`;

  if (departmentId) {
    sqlUsers = `SELECT DISTINCT u.id, user_name, avatar, department_name
    FROM tasks t
    JOIN Users u ON t.assignee = u.id
    JOIN Departments d ON d.id = u.department_id
    WHERE YEAR(created_at) = '${year}' AND assignee <> 0 AND department_id = ${departmentId}
    ORDER BY d.id ASC ;`;

    sqlOnlyUserIds = `SELECT DISTINCT u.id
    FROM tasks t
    JOIN Users u ON t.assignee = u.id
    JOIN Departments d ON d.id = u.department_id
    WHERE YEAR(created_at) = '${year}' AND assignee <> 0 AND department_id = ${departmentId}
    ORDER BY d.id ASC`;
  }

  if (createdBy) {
    sqlUsers = `SELECT DISTINCT u.id, user_name, avatar, department_name
    FROM tasks t
    JOIN Users u ON t.assignee = u.id
    JOIN Departments d ON d.id = u.department_id
    WHERE YEAR(created_at) = '${year}' AND assignee <> 0 AND created_by = ${createdBy}
    ORDER BY d.id ASC ;`;

    sqlOnlyUserIds = `SELECT DISTINCT u.id
    FROM tasks t
    JOIN Users u ON t.assignee = u.id
    JOIN Departments d ON d.id = u.department_id
    WHERE YEAR(created_at) = '${year}' AND assignee <> 0 AND created_by = ${createdBy}
    ORDER BY d.id ASC`;
  }

  if (createdBy && departmentId) {
    sqlUsers = `SELECT DISTINCT u.id, user_name, avatar, department_name
    FROM tasks t
    JOIN Users u ON t.assignee = u.id
    JOIN Departments d ON d.id = u.department_id
    WHERE YEAR(created_at) = '${year}' AND assignee <> 0 AND department_id = ${departmentId} AND created_by = ${createdBy}
    ORDER BY d.id ASC ;`;

    sqlOnlyUserIds = `SELECT DISTINCT u.id
    FROM tasks t
    JOIN Users u ON t.assignee = u.id
    JOIN Departments d ON d.id = u.department_id
    WHERE YEAR(created_at) = '${year}' AND assignee <> 0 AND department_id = ${departmentId} AND created_by = ${createdBy}
    ORDER BY d.id ASC`;
  }

  const getUsersInYear = (sql) =>
    new Promise((resolve, rejects) => {
      db.execute(sql, (error, results) => {
        if (error) rejects(error);
        else resolve(results);
      });
    });

  const getCompleteTasks = (year, sqlOnlyUserIds) =>
    new Promise((resolve, rejects) => {
      const sql = `SELECT tc.user_id as user_id, user_name, avatar, tasks_completed FROM Users u
      JOIN
      (SELECT u.id as user_id, COUNT(t.id) as tasks_completed
      FROM Tasks t JOIN Users u ON t.assignee = u.id
      WHERE YEAR(created_at) = '${year}' AND completed = 1 AND failed = 0 AND paused = 0
      GROUP BY user_id
      HAVING user_id IN (${sqlOnlyUserIds})) AS tc
      ON tc.user_id = u.id
      ;`;
      db.execute(sql, (error, results) => {
        if (error) rejects(error);
        else resolve(results);
      });
    });

  const getFailedTasks = (year, sqlOnlyUserIds) =>
    new Promise((resolve, rejects) => {
      const sql = `SELECT tf.user_id as user_id, user_name, avatar, tasks_failed FROM Users u
      JOIN
      (SELECT u.id as user_id, COUNT(t.id) as tasks_failed
      FROM Tasks t JOIN Users u ON t.assignee = u.id
      WHERE YEAR(created_at) = '${year}' AND completed = 1 AND failed = 1 AND paused = 0
      GROUP BY user_id
      HAVING user_id IN (${sqlOnlyUserIds})) AS tf
      ON tf.user_id = u.id
      ;`;
      db.execute(sql, (error, results) => {
        if (error) rejects(error);
        else resolve(results);
      });
    });

  const getCompletePoint = (year, sqlOnlyUserIds) =>
    new Promise((resolve, rejects) => {
      const sql = `SELECT pc.user_id as user_id, user_name, avatar, point_completed FROM Users u
      JOIN
      (SELECT u.id as user_id, SUM(point) as point_completed
      FROM Tasks t JOIN Users u ON t.assignee = u.id
      WHERE YEAR(created_at) = '${year}' AND completed = 1 AND failed = 0 AND paused = 0
      GROUP BY user_id
      HAVING user_id IN (${sqlOnlyUserIds})) AS pc
      ON pc.user_id = u.id
      ;`;
      db.execute(sql, (error, results) => {
        if (error) rejects(error);
        else resolve(results);
      });
    });

  try {
    const statisticsUsers = [];
    const users = await getUsersInYear(sqlUsers);
    const completedTasks = await getCompleteTasks(year, sqlOnlyUserIds);
    const failedTasks = await getFailedTasks(year, sqlOnlyUserIds);
    const completedPoints = await getCompletePoint(year, sqlOnlyUserIds);
    for (const user of users) {
      const completedTask = completedTasks.find(
        (completedTask) => completedTask.user_id == user.id
      );
      const failedTask = failedTasks.find((failedTask) => failedTask.user_id == user.id);
      const completedPoint = completedPoints.find(
        (completedPoint) => completedPoint.user_id == user.id
      );

      if (completedTask && failedTask && completedPoint) {
        statisticsUsers.push({
          user_id: user.id,
          user_name: user.user_name,
          avatar: user.avatar,
          department_name: user.department_name,
          tasks_completed: completedTask.tasks_completed,
          tasks_failed: failedTask.tasks_failed,
          point_completed: Number(completedPoint.point_completed),
        });
        continue;
      }

      if (completedTask && !failedTask && completedPoint) {
        statisticsUsers.push({
          user_id: user.id,
          user_name: user.user_name,
          avatar: user.avatar,
          department_name: user.department_name,
          tasks_completed: completedTask.tasks_completed,
          tasks_failed: 0,
          point_completed: Number(completedPoint.point_completed),
        });
        continue;
      }

      if (!completedTask && failedTask && !completedPoint) {
        statisticsUsers.push({
          user_id: user.id,
          user_name: user.user_name,
          avatar: user.avatar,
          department_name: user.department_name,
          tasks_completed: 0,
          tasks_failed: failedTask.tasks_failed,
          point_completed: 0,
        });
        continue;
      }
    }

    res.status(200).send({
      statistics_users: statisticsUsers,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
};

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

const handleStatistics = (commitmentPoint, completePoint, inCompletePoint) => {
  const statistics = [];
  months.forEach((month) => {
    const commitment = commitmentPoint.find((commitment) => commitment.month == month);
    const complete = completePoint.find((complete) => complete.month == month);
    const inComplete = inCompletePoint.find((inComplete) => inComplete.month == month);
    if (commitment && complete && inComplete) {
      statistics.push({
        month,
        commitment_point: Number(commitment.commitment_point),
        complete_point: Number(complete.complete_point),
        incomplete_point: Number(inComplete.incomplete_point),
      });
      return;
    }
    if (commitment && !complete && inComplete) {
      statistics.push({
        month,
        commitment_point: Number(commitment.commitment_point),
        complete_point: 0,
        incomplete_point: Number(inComplete.incomplete_point),
      });
      return;
    }
    if (commitment && complete && !inComplete) {
      statistics.push({
        month,
        commitment_point: Number(commitment.commitment_point),
        complete_point: Number(complete.complete_point),
        incomplete_point: 0,
      });
      return;
    }
    if (!commitment) {
      statistics.push({
        month,
        commitment_point: 0,
        complete_point: 0,
        incomplete_point: 0,
      });
      return;
    }
  });
  return statistics;
};

exports.getStatiscticsByPosition = async (req, res) => {
  const body = req.query;
  const year = body.year;
  const positionId = body.position_id;
  const userId = convertUndefined(body.user_id);

  let sqlCommitmentPoint = `SELECT MONTHNAME(created_at) AS month, YEAR(created_at) AS year, SUM(point) AS commitment_point
    FROM Tasks t
    GROUP BY month, year
    HAVING year = '${year}'
    ORDER BY MONTH(created_at) ASC
    ;`;
  let sqlCompletedPoint = `SELECT MONTHNAME(created_at) AS month, YEAR(created_at) AS year, SUM(point) AS complete_point
    FROM Tasks t
    WHERE completed = 1 AND failed = 0
    GROUP BY month, year
    HAVING year = '${year}'
    ORDER BY MONTH(created_at) ASC
    ;`;
  let sqlFailedPoint = `SELECT MONTHNAME(created_at) AS month, YEAR(created_at) AS year, SUM(point) AS incomplete_point
    FROM Tasks t
    WHERE completed = 1 AND failed = 1
    GROUP BY month, year
    HAVING year = '${year}'
    ORDER BY MONTH(created_at) ASC
    ;`;

  if (positionId == 2) {
    sqlCommitmentPoint = `SELECT MONTHNAME(created_at) AS month, YEAR(created_at) AS year, SUM(point) AS commitment_point
      FROM Tasks t
      WHERE created_by = ${userId}
      GROUP BY month, year
      HAVING year = '${year}'
      ORDER BY MONTH(created_at) ASC
      ;`;
    sqlCompletedPoint = `SELECT MONTHNAME(created_at) AS month, YEAR(created_at) AS year, SUM(point) AS complete_point
      FROM Tasks t
      WHERE completed = 1 AND failed = 0 AND created_by = ${userId}
      GROUP BY month, year
      HAVING year = '${year}'
      ORDER BY MONTH(created_at) ASC
      ;`;
    sqlFailedPoint = `SELECT MONTHNAME(created_at) AS month, YEAR(created_at) AS year, SUM(point) AS incomplete_point
      FROM Tasks t
      WHERE completed = 1 AND failed = 1 AND created_by = ${userId}
      GROUP BY month, year
      HAVING year = '${year}'
      ORDER BY MONTH(created_at) ASC
      ;`;
  }

  if (positionId == 3) {
    sqlCommitmentPoint = `SELECT MONTHNAME(created_at) AS month, YEAR(created_at) AS year, SUM(point) AS commitment_point
      FROM Tasks t
      WHERE assignee = ${userId}
      GROUP BY month, year
      HAVING year = '${year}'
      ORDER BY MONTH(created_at) ASC
      ;`;
    sqlCompletedPoint = `SELECT MONTHNAME(created_at) AS month, YEAR(created_at) AS year, SUM(point) AS complete_point
      FROM Tasks t
      WHERE completed = 1 AND failed = 0 AND assignee = ${userId}
      GROUP BY month, year
      HAVING year = '${year}'
      ORDER BY MONTH(created_at) ASC
      ;`;
    sqlFailedPoint = `SELECT MONTHNAME(created_at) AS month, YEAR(created_at) AS year, SUM(point) AS incomplete_point
      FROM Tasks t
      WHERE completed = 1 AND failed = 1 AND assignee = ${userId}
      GROUP BY month, year
      HAVING year = '${year}'
      ORDER BY MONTH(created_at) ASC
      ;`;
  }

  const getCommitmentPoint = (sql) =>
    new Promise((resolve, rejects) => {
      db.execute(sql, (error, results) => {
        if (error) rejects(error);
        else resolve(results);
      });
    });

  const getCompletePoint = (sql) =>
    new Promise((resolve, rejects) => {
      db.execute(sql, (error, results) => {
        if (error) rejects(error);
        else resolve(results);
      });
    });

  const getIncompletePoint = (sql) =>
    new Promise((resolve, rejects) => {
      db.execute(sql, (error, results) => {
        if (error) rejects(error);
        else resolve(results);
      });
    });

  try {
    const commitmentPoint = await getCommitmentPoint(sqlCommitmentPoint);
    const completePoint = await getCompletePoint(sqlCompletedPoint);
    const inCompletePoint = await getIncompletePoint(sqlFailedPoint);

    const statistics = handleStatistics(commitmentPoint, completePoint, inCompletePoint);
    res.status(200).send({
      statistics,
    });
  } catch (error) {
    res.status(500).send(error);
  }
};
