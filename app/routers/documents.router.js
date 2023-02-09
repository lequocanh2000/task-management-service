module.exports = (app) => {
  const documents = require("../controllers/documents.controller");
  var router = require("express").Router();
  router.get("/", documents.getAll);
  router.get("/:task_id/task-documents", documents.getDocumentsOfTask);
  // router.get("/:id", documents.getOne);
  router.post("/", documents.create);
  // router.put("/:id", documents.update);
  router.delete("/:id", documents.delete);
  // router.delete("/", khoa.deleteAll);
  app.use("/documents", router);
};
