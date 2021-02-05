import express from "express";
import bodyParser from "body-parser";
const app = express();
// import helper from "./utilis/helper";
import cors from "cors";

import swaggerUi from "swagger-ui-express";
import swaggerDocument from "./swagger.json";

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.json({ message: "Welcome to Global Homes App" });
});

app.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

//CORS middleware
const allowCrossDomain = (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type, authorization,x-access-token,apikey");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,PATCH,OPTIONS");
  next();
};

app.use(allowCrossDomain);
app.use(cors());

// app.use(helper.tokenVerify);
// app.use(helper.auth);

//Get Routes
import routes from "./routes/";
app.use("/", routes);

// express doesn't consider not found 404 as an error so we need to handle 404 explicitly
// handle 404 error
app.use((req, res, next) => {
  let err = new Error("Not Found");
  err.status = 404;
  next(err);
});

// handle errors
app.use((err, req, res, next) => {
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

export default app;
