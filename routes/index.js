var express = require("express");
var auth = require("./auth");
var router = express.Router();
var user = require("./user");

router.use("/auth", auth);
router.use("/user", user);

module.exports = router;
