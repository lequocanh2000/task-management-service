module.exports = (app) => {
  const users = require("../controllers/users.controller");
  var router = require("express").Router();
  router.get("/", users.getAll);
  router.get("/users-departments", users.getUsersByDepartmentAll);
  router.get("/:id", users.getOne);
  // router.post("/", khoa.create);
  // router.put("/:id", khoa.update);
  // router.delete("/:id", khoa.delete);
  // router.delete("/", khoa.deleteAll);
  app.use("/users", router);
};
