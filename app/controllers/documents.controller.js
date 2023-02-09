const db = require("../config/db.config");

exports.getAll = (req, res) => {
  const sql = "SELECT * FROM Documents";
  db.query(sql, (err, result) => {
    if (err) res.status(500).send(err);
    else res.status(200).send({ documents: result });
  });
};

exports.getDocumentsOfTask = async (req, res) => {
  const task_id = req.params.task_id;
  const getDocumentOfTask = (task_id) =>
    new Promise((resolve, rejects) => {
      const sql = `SELECT d.id, task_id, descriptions, created_by, u.user_name, u.avatar, u.email, u.password
      FROM Documents d JOIN Users u ON d.created_by = u.id
      WHERE task_id = ${task_id}`;
      db.execute(sql, (error, results) => {
        if (error) rejects(error);
        else resolve(results);
      });
    });
  const getDocumentId = (task_id) =>
    new Promise((resolve, rejects) => {
      const sql = `SELECT id FROM Documents WHERE task_id = ${task_id}`;
      db.execute(sql, (error, results) => {
        if (error) rejects(error);
        else resolve(results);
      });
    });

  const getDocumentDetails = (document_id) =>
    new Promise((resolve, rejects) => {
      const sql = `SELECT id, name, url FROM Document_Details WHERE document_id = ${document_id}`;
      db.execute(sql, (error, results) => {
        if (error) rejects(error);
        else resolve(results);
      });
    });

  try {
    const documentsArr = [];
    const documents = await getDocumentOfTask(task_id);
    const documentIds = await getDocumentId(task_id);
    for (const document of documents) {
      const documentDetails = await getDocumentDetails(document.id);
      documentsArr.push({
        ...document,
        document_details: [...documentDetails],
      });
    }

    res.send({
      documents: documentsArr,
    });
  } catch (error) {
    res.send({
      error: error,
    });
  }
};

exports.create = async (req, res) => {
  const body = req.body;

  const createDocument = (descriptions, task_id, created_by) =>
    new Promise((resolve, rejects) => {
      const sql = `INSERT INTO Documents
        (
        descriptions,
        task_id,
        created_by
        )
        VALUES (
         '${descriptions}',
          ${task_id},
          ${created_by}
        )`;
      db.execute(sql, (error, results) => {
        if (error) rejects(error);
        else resolve(results);
      });
    });

  const getDocumentId = () =>
    new Promise((resolve, rejects) => {
      const sql = `SELECT id FROM Documents ORDER BY id DESC LIMIT 1`;
      db.execute(sql, (error, results) => {
        if (error) rejects(error);
        else resolve(results);
      });
    });

  const createDocumentDetails = (name, url, document_id) =>
    new Promise((resolve, rejects) => {
      const sql = `INSERT INTO Document_Details
        (
        name,
        url,
        document_id
        )
        VALUES (
         '${name}',
          '${url}',
          ${document_id}
        )`;
      db.execute(sql, (error, results) => {
        if (error) rejects(error);
        else resolve(results);
      });
    });

  const descriptions = body.descriptions;
  const documentFiles = body.documentFiles;
  const task_id = body.task_id;
  const created_by = body.user_id;

  try {
    await createDocument(descriptions, Number(task_id), Number(created_by));
    const documentId = await getDocumentId();
    for (const documentFile of documentFiles) {
      await createDocumentDetails(documentFile.name, documentFile.url, documentId[0].id);
    }
    res.send({ message: "created document successfully" });
  } catch (error) {
    res.send({ error: error });
    console.log(error);
  }
};

exports.delete = (req, res) => {
  const id = req.params.id;
  const sql = `DELETE FROM Documents WHERE id = ${id}`;
  db.query(sql, (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).send(err);
    } else res.status(200).send({ message: "deleted successfully" });
  });
};
