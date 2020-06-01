const express = require("express");
const router = express.Router();
var helper = require("../utilis/helper");
const userController = require("../controller/user");

//Register
router.post("/signup", userController.create);

//Login
router.post("/signin", userController.authenticate);

module.exports = router;
