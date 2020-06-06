const express = require("express");
const router = express.Router();
var helper = require("../utilis/helper");
const userController = require("../controller/user");

//Register
router.post("/signup", userController.create);

//Login
router.post("/signin", userController.authenticate);

//Forgot Password
router.post("/forgotPassword", userController.forgotPassword);

//VerificationCode
router.post("/verify", helper.validateToken, userController.verifyCode);

//Resend Verification Code
router.post("/resend-code", helper.validateToken, userController.resendCode);

module.exports = router;
