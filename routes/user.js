const express = require("express");
const router = express.Router();
var helper = require("../utilis/helper");
const userController = require("../controller/user");

//Register
router.post("/signup", userController.create);

module.exports = router;
