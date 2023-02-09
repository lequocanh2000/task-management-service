module.exports = (app) => {
  const tasks = require("../controllers/tasks.controller");
  var router = require("express").Router();
  router.get("/", tasks.getAll);
  router.get("/tasks-subs", tasks.getAllTasksHaveSubs);
  router.get("/check-tasks", tasks.updateFailed);
  router.get("/task-document-comment", tasks.getDocumentTotalAndCommentTotalOfTask);
  router.get("/:id", tasks.getOne);
  router.get("/:id/sub-tasks", tasks.getAllSubsOfTask);
  // router.get("/:id/parent-task", tasks.getParentTask);
  router.post("/", tasks.create);
  router.put("/:id", tasks.update);
  router.put("/:id/paused", tasks.updatePaused);
  router.delete("/:id", tasks.delete);
  app.use("/tasks", router);
};
