module.exports = (app) => {
  const taskTypes = require("../controllers/taskTypes.controller");
  var router = require("express").Router();
  router.get("/", taskTypes.getAll);
  // router.get("/taskTypes-subs", taskTypes.getAllTaskTypesHaveSubs);
  // router.get("/:id", taskTypes.getOne);
  // router.post("/", taskTypes.create);
  // router.put("/:id", taskTypes.update);
  // router.delete("/:id", taskTypes.delete);
  // router.delete("/", khoa.deleteAll);
  app.use("/task-types", router);
};
