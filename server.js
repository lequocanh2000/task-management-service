const express = require("express");
const app = express();
var cors = require("cors");

app.use(cors());
app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.json({ message: "Welcome to application" });
});

require("./app/routers/users.router")(app);
require("./app/routers/tasks.router")(app);
require("./app/routers/taskTypes.router")(app);
require("./app/routers/documents.router")(app);
require("./app/routers/departments.router")(app);
require("./app/routers/comments.router")(app);
require("./app/routers/notifications.router")(app);
require("./app/routers/statistics.router")(app);
require("./app/routers/reports.router")(app);
require("./app/routers/overviews.router")(app);

app.listen(3001, () => {
  console.log("Yey, your server is running on port 3001");
});
