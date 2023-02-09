module.exports = (app) => {
  const notifications = require("../controllers/notifications.controller");
  var router = require("express").Router();
  router.get("/", notifications.getAll);
  router.get("/:id", notifications.getOne);
  router.get("/:user_id/user-notifications", notifications.getNotificationsOfUser);
  router.post("/", notifications.create);
  router.put("/:id", notifications.update);
  router.delete("/:id", notifications.delete);
  app.use("/notifications", router);
};
