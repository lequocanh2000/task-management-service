module.exports = (app) => {
  const departments = require("../controllers/departments.controller");
  var router = require("express").Router();
  router.get("/", departments.getAll);
  // router.get("/departments-subs", departments.getAlldepartmentsHaveSubs);
  // router.get("/:id", departments.getOne);
  // router.post("/", departments.create);
  // router.put("/:id", departments.update);
  // router.delete("/:id", departments.delete);
  // router.delete("/", khoa.deleteAll);
  app.use("/departments", router);
};
