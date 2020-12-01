import express from "express"
import helper from "../utilis/helper"
import userController from "../controller/user_controller"
import upload from '../utilis/file.handler'

const route = express.Router();

// Unauthenticate roues
route.post("/signup", userController.create); // Register route
route.post("/signin", userController.authenticate); // Login route
route.put("/verify/code", userController.verifyCode); // VerificationCode route
route.post("/resend/code", userController.resendCode); // Resend verification code route

//route.post("/resend/code", helper.validateToken, userController.resendCode); // Resend verification code route


route.post("/forgot/password", userController.forgotPassword); // Forgot password route with send email
route.put("/set/password", userController.setPasswordWithVerifyCode); // Set password route

route.post("/shortcut/image/upload", upload.single('image'), userController.uploadShortCutImages); // upload shortcut images
route.get("/shortcut/image/get", userController.getShortCutImages) // get shortcut images

// Authenticate routess
route.put("/unit", helper.validateToken, userController.setUserUnitID); // Set password route
route.get("/userDetail", helper.validateToken, userController.getUserDetail); // Set password route




export default route;
