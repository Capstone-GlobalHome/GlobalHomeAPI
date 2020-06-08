const bodyParser = require("body-parser");
const express = require("express");
const app = express();
const helper = require("./utilis/helper");

var swaggerUi = require("swagger-ui-express"),
  swaggerDocument = require("./swagger/swagger.json");
var cors = require("cors");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", function (req, res) {
  res.json({ message: "Welcome to Global Homes App" });
});

app.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

//CORS middleware
var allowCrossDomain = function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type, authorization,x-access-token,apikey");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,PATCH,OPTIONS");
  next();
};

app.use(allowCrossDomain);
app.use(cors());

app.use(helper.tokenVerify);
app.use(helper.auth);

//Get Routes
app.use("/", require("./routes/"));

// express doesn't consider not found 404 as an error so we need to handle 404 explicitly
// handle 404 error
app.use(function (req, res, next) {
  console.log("Handle Error Not found");
  let err = new Error("Not Found");
  err.status = 404;
  next(err);
});

// handle errors
app.use(function (err, req, res, next) {
  console.log("Handle Error", err);
  if (err.status === 404) {
    res.status(404).json({
      status: "error",
      message: [{ error: "Not found, " + err.message }],
      data: null,
    });
  } else {
    res.status(500).json({
      status: "error",
      message: [{ error: "Something looks wrong, " + err.message }],
      data: null,
    });
  }
});

module.exports = app;
