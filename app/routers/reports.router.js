module.exports = (app) => {
  const reports = require("../controllers/reports.controller");
  var router = require("express").Router();
  router.get("/", reports.getAll);
  // router.get("/:userId", reports.getOneByUserId);
  router.get("/report-users", reports.getReportUsers);
  // router.post("/", khoa.create);
  // router.put("/:id", khoa.update);
  // router.delete("/:id", khoa.delete);
  // router.delete("/", khoa.deleteAll);
  app.use("/reports", router);
};
