const dotenv = require("dotenv");
dotenv.config();
var config = require("./config/config");
const app = require("./app");

app.listen(config.port, function () {
  console.log("Node server listen on port " + config.port);
});
