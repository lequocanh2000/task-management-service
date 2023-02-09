module.exports = (app) => {
  const overviews = require("../controllers/overviews.controller");
  var router = require("express").Router();
  router.get("/", overviews.getAll);
  // router.get("/:userId", overviews.getOneByUserId);
  // router.get("/overviews-position", overviews.getOverviewByPosition);
  // router.post("/", khoa.create);
  // router.put("/:id", khoa.update);
  // router.delete("/:id", khoa.delete);
  // router.delete("/", khoa.deleteAll);
  app.use("/overviews", router);
};
