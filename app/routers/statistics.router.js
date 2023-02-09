module.exports = (app) => {
  const statistics = require("../controllers/statistics.controller");
  var router = require("express").Router();
  router.get("/", statistics.getAll);
  router.get("/statistics-users", statistics.getStatisticsByUsers);
  router.get("/statistics-position", statistics.getStatiscticsByPosition);
  // router.post("/", khoa.create);
  // router.put("/:id", khoa.update);
  // router.delete("/:id", khoa.delete);
  // router.delete("/", khoa.deleteAll);
  app.use("/statistics", router);
};
