module.exports = (app) => {
  const comments = require("../controllers/comments.controller");
  var router = require("express").Router();
  router.get("/", comments.getAll);
  router.get("/:id", comments.getOne);
  router.get("/:task_id/task-comments", comments.getCommentsOfTask);
  router.post("/", comments.create);
  router.put("/:id", comments.update);
  router.delete("/:id", comments.delete);
  app.use("/comments", router);
};
