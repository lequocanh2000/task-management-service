const db = require("../config/db.config");

const convertUndefined = (value) => {
  if (value) {
    if (value == "undefined") return undefined;
    else return value;
  }
  return undefined;
};

exports.getAll = (req, res) => {
  const body = req.query;
  const email = body.email;
  const password = body.password;
  if (email && password) {
    const sql = `SELECT u.id as id, user_name, avatar, email, password, position_id, department_id, position_name, department_name FROM Users u
    JOIN Positions p ON u.position_id = p.id
    JOIN Departments d ON u.department_id = d.id
    WHERE email = '${email}' and password = '${password}' ;`;
    console.log(sql);
    db.query(sql, (err, result) => {
      if (err) res.status(500).send(err);
      else res.status(200).send({ users: result });
    });
    return;
  }
  const sql = `SELECT u.id as id, user_name, avatar, email, password, position_id, department_id, position_name, department_name FROM Users u
  JOIN Positions p ON u.position_id = p.id
  JOIN Departments d ON u.department_id = d.id ;`;
  db.query(sql, (err, result) => {
    if (err) res.status(500).send(err);
    else res.status(200).send({ users: result });
  });
};

exports.getOne = (req, res) => {
  const id = req.params.id;
  const sql = `SELECT u.id as id, user_name, avatar, email, password, position_id, department_id, position_name, department_name FROM Users u
  JOIN Positions p ON u.position_id = p.id
  JOIN Departments d ON u.department_id = d.id
  WHERE u.id = ? ;`;
  db.query(sql, [id], (err, result) => {
    if (err) res.status(500).send(err);
    else res.status(200).send({ users: result });
  });
};

exports.getUsersByDepartmentAll = async (req, res) => {
  const body = req.query;
  const positionId = body.position_id;
  const departmentId = body.department_id;
  const userId = convertUndefined(body.user_id);

  const getDepartments = () =>
    new Promise((resolve, rejects) => {
      const sql = `SELECT * FROM Departments;`;
      db.execute(sql, (error, results) => {
        if (error) rejects(error);
        else resolve(results);
      });
    });

  const getUsersByDepartmentId = (id, positionId, userId) =>
    new Promise((resolve, rejects) => {
      let sql = `SELECT u.id as id, user_name, avatar, email, password, position_id, department_id, department_name
                  FROM Users u JOIN Departments d ON u.department_id = d.id
                  WHERE department_id = ${id} AND position_id <> ${positionId}
                  ORDER BY department_id ASC ;`;
      if (positionId == 2) {
        sql = `SELECT u.id as id, user_name, avatar, email, password, position_id, department_id, department_name
                  FROM Users u JOIN Departments d ON u.department_id = d.id
                  WHERE department_id = ${id} AND position_id <> 1 AND position_id <> ${positionId}
                  ORDER BY department_id ASC ;`;
      }
      if (positionId == 3 && userId) {
        sql = `SELECT u.id as id, user_name, avatar, email, password, position_id, department_id, department_name
                  FROM Users u JOIN Departments d ON u.department_id = d.id
                  WHERE department_id = ${id} AND position_id <> 1 AND position_id <> 2 AND u.id = ${userId}
                  ORDER BY department_id ASC ;`;
      }
      db.execute(sql, (error, results) => {
        if (error) rejects(error);
        else resolve(results);
      });
    });

  try {
    const departmentsUsers = [];
    const departments = await getDepartments();
    if (positionId != 3) {
      for (const department of departments) {
        const usersByDepartmentId = await getUsersByDepartmentId(department.id, positionId, userId);
        if (!usersByDepartmentId.length) continue;
        departmentsUsers.push({
          department_id: department.id,
          department_name: department.department_name,
          users: usersByDepartmentId,
        });
      }
    } else {
      const department = departments.find((department) => department.id == departmentId);
      const usersByDepartmentId = await getUsersByDepartmentId(departmentId, positionId, userId);
      departmentsUsers.push({
        department_id: departmentId,
        department_name: department.department_name,
        users: usersByDepartmentId,
      });
    }
    res.status(200).send({ departments_users: departmentsUsers });
  } catch (error) {
    res.status(500).send(error);
  }
};
