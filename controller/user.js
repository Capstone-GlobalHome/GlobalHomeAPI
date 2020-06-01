"use strict";

var helper = require("../utilis/helper");
const messages = require(__dirname + "/../config/messages.json");
var config = require("../config/config");
var moment = require("moment-timezone");
const Sequelize = require("sequelize");
const _ = require("lodash");
const Op = Sequelize.Op;
var jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

class UserController {
  //Authenticate User
  async authenticate(req, res, next) {
    try {
      console.log("authenticate called");
      var errors = [];

      var { email, password } = req.body;

      //both email and password missing -
      if (!email && !password) {
        return res.status(400).send({
          status: "error",
          message: [{ error: "Please enter your login information" }],
          data: null,
        });
      }
      if (!email) {
        errors.push({ email: messages.USER_EMPTY_EMAIL });
      }
      if (!password) {
        errors.push({ password: messages.USER_INVALID_PASSWORD });
      }

      if (errors.length > 0) {
        return res.status(400).json({
          status: "error",
          message: errors,
          token: null,
          data: null,
        });
      } else {
        //Fetch user details

        //var hashPassword = userInfo.password;
        if (email == "harpreet.iosdev@gmail.com" && password == "12345678") {
          //Create JWT Token
          const newToken = await helper.createTokens(1, "harpreet", process.env.API_KEY, process.env.REFRESH_KEY);

          //Response -
          return res.status(200).json({
            status: "success",
            message: messages.AUTH_SUCCESS_LOGGEDIN,
            token: newToken.token,
            tokenExpireAt: newToken.token ? new Date(jwt.decode(newToken.token).exp * 1000) : "",
            refreshToken: newToken.refreshToken,
            refreshTokenExpireAt: newToken.refreshToken ? new Date(jwt.decode(newToken.refreshToken).exp * 1000) : "",
            data: {
              user: {
                id: 1,
                name: "harpreet",
                fullname: "harpreet",
                email: "harpreet.iosdev@gmail.com",
                rememberToken: null,
                notifications: 0,
                lastLogin: null,
                createdAt: "2020-05-20T02:06:36.000Z",
                updatedAt: "2020-05-20T02:06:36.000Z",
              },
            },
          });
        } else {
          return res.status(401).json({
            status: "error",
            message: [{ error: messages.AUTH_INVALID_LOGIN }],
            token: null,
            data: null,
          });
        }
      }
    } catch (err) {
      console.log("Catch Error", err);
      next(err);
    }
  }

  //SignUp New User
  async create(req, res, next) {
    try {
      console.log(req.body);
      var errors = [];
      var { fullname, email, password, confirmationPassword } = req.body;

      if (!fullname || !email || !password || !confirmationPassword) {
        errors.push({ error: "Please complete all form fields" });
      }

      if (!fullname) {
        errors.push({ fullname: messages.USER_INVALID_USERNAME });
      } else if (fullname.length < 3 || fullname.length > 20) {
        errors.push({
          "fullname-length": "fullname must be in between 3 to 20 characters in length.",
        });
      }

      if (!email) {
        errors.push({ email: "Please enter your email" });
      } else if (!/^[\-0-9a-zA-Z\.\+_]+@[\-0-9a-zA-Z\.\+_]+\.[a-zA-Z]{2,}$/.test(String(email))) {
        errors.push({ email: messages.USER_INVALID_EMAIL });
      }

      if (!password) {
        errors.push({ password: "Please enter a password" });
      } else if (password.length < 8) {
        errors.push({
          "password-length": "The password length should be minumum 8 characters",
        });
      }

      if (!confirmationPassword) {
        errors.push({
          confirmationPassword: messages.USER_INVALID_CONFIRM_PASSWORD,
        });
      }

      if (password != confirmationPassword) {
        errors.push({
          error: "password & confirmationPassword doesn't match",
        });
      }

      if (errors.length > 0) {
        return res.status(400).send({ status: "error", message: errors, data: null });
      } else {
        //Create JWT Token
        const newToken = await helper.createTokens(1, "harpreet", process.env.API_KEY, process.env.REFRESH_KEY);

        var subject = "GlobalHome Verification Code";
        var bodyOfMail = "New account verificaiton code is :\n\n" + "\n\n" + "4444\n\n";
        console.log("GlobalHome Verification Code");
        await sendMail(subject, bodyOfMail, req.body.email);

        //Response -
        return res.status(200).json({
          status: "success",
          message: messages.USER_SUCCESS_REGISTER,
          token: newToken.token,
          tokenExpireAt: newToken.token ? new Date(jwt.decode(newToken.token).exp * 1000) : "",
          refreshToken: newToken.refreshToken,
          refreshTokenExpireAt: newToken.refreshToken ? new Date(jwt.decode(newToken.refreshToken).exp * 1000) : "",
          data: {
            user: {
              id: 1,
              name: "harpreet",
              fullname: "harpreet",
              email: "harpreet.iosdev@gmail.com",
              rememberToken: null,
              notifications: 0,
              lastLogin: null,
              createdAt: "2020-05-20T02:06:36.000Z",
              updatedAt: "2020-05-20T02:06:36.000Z",
            },
          },
        });
      }
    } catch (err) {
      next(err);
    }
  }

  //Forgot Password
  async forgotPassword(req, res, next) {
    try {
      if (req.body.email && req.body.email.trim() != "") {
        var subject = "GlobalHome Password Reset";
        var bodyOfMail =
          "You are receiving this email because we received a password reset request for your account:\n\n" +
          "\n\n" +
          "If you did not request a password reset, no further action is required.\n\n" +
          "If you don’t use this link within 1 hour, it will expire.\n\n";
        console.log("Before Send");
        await sendMail(subject, bodyOfMail, req.body.email);
        console.log("After Send");
        res.status(200).json({
          status: "success",
          message: "Check your email for a link to reset your password.",
          data: null,
        });
      } else {
        res.status(400).json({
          status: "error",
          message: [{ error: "The email is required." }],
          data: null,
        });
      }
    } catch (ex) {
      next(ex);
    }
  }
}

//Send Email via Provider
async function sendMail(subject, bodyOfMail, receiverMailId) {
  const sendgrid = require("@sendgrid/mail");

  sendgrid.setApiKey(process.env.SENDGRID_ApiKey);
  console.log("from: ", config.senderMailId, "to: ", receiverMailId);
  const msg = {
    to: receiverMailId,
    from: config.senderMailId,
    subject: subject,
    text: bodyOfMail,
  };
  console.log("First", msg);
  await (() => {
    console.log("second");
    sendgrid
      .send(msg)
      .then(() => {
        console.log("email sent successfully");
      })
      .catch((error) => {
        console.log("error");
        console.error(error.toString());
      });
  })();
  console.log("third");
}

module.exports = new UserController();
