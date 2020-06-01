const express = require("express");
const router = express.Router();
var helper = require("../utilis/helper");
const authController = require("../controller/auth");
var passport = require("passport");
var jwt = require("jsonwebtoken");

//Login
router.post("/signin", authController.authenticate);

module.exports = router;
