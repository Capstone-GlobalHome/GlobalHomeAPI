"use strict";

import { Validator } from 'node-input-validator'
import moment from "moment"
import Sequelize from "sequelize"
import _ from "lodash"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import Helper from "../utilis/Helper"
import { environment } from "../config/environment"
import { STATUS, RESEND_CODE_TIME, MESSAGES } from "../constants/user.constant"
// Models
import db from '../models'
const Op = Sequelize.Op;
const User = db.User

class UserController {
  //SignUp New User
  static async create(req, res, next) {
    try {
      const v = new Validator(req.body, {
        name: 'required',
        email: 'required|email',
        password: 'required|minLength:7'
      })
      const matched = await v.check()
      if (!matched) {
        res.status(422).json({ error: true, message: MESSAGES.VALIDATION_ERROR, validation_error: v.errors })
        return;
      } else {
        User.findOne({ where: { email: req.body.email } }).then(result => {
          if (result) {
            res.status(409).json({ error: true, message: `${req.body.email} : already exists.` }); return;
          } else {
            bcrypt.genSalt(10, async (err, salt) => {
              bcrypt.hash(req.body.password, salt, async (err, hash) => {
                if (err) {
                  res.status(500).json({ error: true, message: err });
                } else {
                  let code = Math.floor(1000 + Math.random() * 9000);
                  let subject = "GlobalHome Verification Code";
                  let bodyOfMail = '<p>Hi ' + req.body.name + ', </p><p>Global Home new account verificaiton code is <b>' + code + '</b>.</p><p>Thank You</p><p> GlobalHome</p>'
                  const mail = Helper.sendMail(subject, bodyOfMail, req.body.email);
                  if (mail) {
                    User.create({
                      name: req.body.name,
                      email: req.body.email,
                      password: hash,
                      verification_code: code,
                      resend_code_time: RESEND_CODE_TIME.SIGNUP_CODE
                    }).then(user => {
                      res.status(200).json({
                        error: false,
                        message: MESSAGES.SENT_VERIFICATION_CODE,
                        userId: user.id
                      });
                    });
                  } else {
                    res.status(400).json({ error: true, message: MESSAGES.EMAIL_SERVER_ERROR })
                  }
                }
              });
            });
          }
        });
      }
    } catch (err) {
      next(err);
    }
  }

  //SignUp New User
  // async create(req, res, next) {
  //   try {
  //     const v = new Validator(req.body, {
  //       email: 'required|email',
  //       password: 'required|minLength:6'
  //     })
  //     const matched = await v.check()
  //     if (!matched) {
  //       res.status(422).json({ error: true, message: MESSAGES.VALIDATION_ERROR, validation_error: v.errors })
  //       return;
  //     } else {

  //     }
  //     var errors = [];
  //     var { fullname, email, password, confirmationPassword } = req.body;

  //     if (!fullname || !email || !password || !confirmationPassword) {
  //       errors.push({ error: "Please complete all form fields" });
  //     }

  //     if (!fullname) {
  //       errors.push({ fullname: messages.USER_INVALID_USERNAME });
  //     } else if (fullname.length < 3 || fullname.length > 20) {
  //       errors.push({
  //         "fullname-length": "fullname must be in between 3 to 20 characters in length.",
  //       });
  //     }

  //     if (!email) {
  //       errors.push({ email: "Please enter your email" });
  //     } else if (!/^[\-0-9a-zA-Z\.\+_]+@[\-0-9a-zA-Z\.\+_]+\.[a-zA-Z]{2,}$/.test(String(email))) {
  //       errors.push({ email: messages.USER_INVALID_EMAIL });
  //     }

  //     if (!password) {
  //       errors.push({ password: "Please enter a password" });
  //     } else if (password.length < 8) {
  //       errors.push({
  //         "password-length": "The password length should be minumum 8 characters",
  //       });
  //     }

  //     if (!confirmationPassword) {
  //       errors.push({
  //         confirmationPassword: messages.USER_INVALID_CONFIRM_PASSWORD,
  //       });
  //     }

  //     if (password != confirmationPassword) {
  //       errors.push({
  //         error: "password & confirmationPassword doesn't match",
  //       });
  //     }

  //     if (errors.length > 0) {
  //       return res.status(400).send({ statusCode: 400, status: "error", message: errors, data: null });
  //     } else {
  //       const response = await helper.postUser(fullname, email, password);
  //       console.log("res", response);

  //       if (!response.status) {
  //         return res.status(401).json({
  //           statusCode: 401,
  //           status: "error",
  //           message: [{ error: messages.USER_EMAIL_ALREADY_EXIST }],
  //           token: null,
  //           data: null,
  //         });
  //       } else {
  //         //Create JWT Token
  //         const newToken = await helper.createTokens(response.data, email,
  //           process.env.API_KEY, process.env.REFRESH_KEY);

  //         //Send 4 digit verification code on user email
  //         var fourDigitCode = Math.floor(1000 + Math.random() * 9000);

  //         //Save Verification code for verification
  //         const responsevc = await helper.addVerificationCode(response.data, email, fourDigitCode);
  //         console.log("VC-", responsevc);

  //         //Send Email
  //         var subject = "GlobalHome Verification Code";
  //         var bodyOfMail = "Global Home new account verificaiton code is :" + fourDigitCode;
  //         await sendMail(subject, bodyOfMail, req.body.email);

  //         //Response -
  //         return res.status(200).json({
  //           statusCode: 200,
  //           status: "success",
  //           message: messages.USER_SUCCESS_REGISTER,
  //           token: newToken.token,
  //           tokenExpireAt: newToken.token ? new Date(jwt.decode(newToken.token).exp * 1000) : "",
  //           refreshToken: newToken.refreshToken,
  //           refreshTokenExpireAt: newToken.refreshToken ? new Date(jwt.decode(newToken.refreshToken).exp * 1000) : "",
  //           data: {
  //             user: {
  //               id: response.data,
  //               fullname: response.name,
  //               email: email,
  //               rememberToken: null,
  //               notifications: 0,
  //               lastLogin: null,
  //               status: "Pending_verificaiton",
  //               createdAt: Date.now(),
  //               updatedAt: Date.now(),
  //             },
  //           },
  //         });
  //       }
  //     }
  //   } catch (err) {
  //     next(err);
  //   }
  // }


  //Verify verification code
  static async verifyCode(req, res, next) {
    try {
      const v = new Validator(req.body, {
        userId: 'required|integer',
        verification_code: 'required|minLength:4'
      })
      const matched = await v.check()
      if (!matched) {
        res.status(422).json({ error: true, message: MESSAGES.VALIDATION_ERROR, validation_error: v.errors })
        return;
      } else {
        const checkOTPRightOrWrong = await User.findOne({
          where: {
            id: req.body.userId, verification_code: req.body.verification_code,
          },
          attributes: ['id', 'verification_code', 'name', 'email', 'status', 'createdAt']
        })
        if (typeof checkOTPRightOrWrong !== 'undefined' && checkOTPRightOrWrong !== null) {
          const user = await User.findOne({
            where: {
              id: checkOTPRightOrWrong.id, verification_code: checkOTPRightOrWrong.verification_code,
              updatedAt: { [Op.gte]: moment().subtract(30, 'minute').toDate() }
            },
            attributes: ['id', 'verification_code', 'name', 'email', 'status', 'createdAt']
          })
          if (typeof user !== 'undefined' && user !== null) {
            await user.update({ verification_code: null, resend_code_time: RESEND_CODE_TIME.SIGNUP_CODE, status: STATUS.ACTIVE })
            let data = {
              id: user.id,
              name: user.name,
              email: user.email,
              status: user.status,
              createdAt: user.createdAt,
              updatedAt: user.updatedAt
            }
            let token = jwt.sign(user.dataValues, environment.JWT_SECRET_KEY, { expiresIn: environment.JWT_EXPIRY_TIME })
            res.status(200).json({
              error: false,
              message: "User verified successfully.",
              user: data,
              token: token
            })
          } else {
            await User.update({ verification_code: null, resend_code_time: RESEND_CODE_TIME.SIGNUP_CODE }, { where: { id: checkOTPRightOrWrong.id } })
            res.status(500).json({ error: true, message: MESSAGES.VERIFICATION_CODE_EXPIRED })
          }
        } else {
          res.status(500).json({ error: true, message: MESSAGES.VERIFICATION_CODE_WRONG })
        }
      }
    } catch (error) {
      next(error);
    }
  }

  // async verifyCode(req, res, next) {
  //   try {
  //     var errors = [];
  //     var { verificationCode } = req.body;

  //     if (!verificationCode) {
  //       errors.push({ verificationCode: "Please enter your verification code received in email" });
  //     }

  //     if (errors.length > 0) {
  //       return res.status(400).send({ statusCode: 400, status: "error", message: errors, data: null });
  //     } else {
  //       const response = await helper.verify(req, verificationCode);
  //       console.log("response", response);

  //       if (response.status) {
  //         res.status(200).json({
  //           statusCode: 200,
  //           status: "success",
  //           message: "user successfully verified.",
  //           data: null,
  //         });
  //       } else {
  //         if (response.account_status) {
  //           res.status(400).json({
  //             statusCode: 400,
  //             status: "error",
  //             message: "Account Blocked",
  //             data: null,
  //           });
  //         } else {
  //           res.status(400).json({
  //             statusCode: 400,
  //             status: "error",
  //             message: "Invalid verification code",
  //             data: null,
  //           });
  //         }
  //       }
  //     }
  //   } catch (error) {
  //     next(error);
  //   }
  // }

  //Resend verification code
  static async resendCode(req, res, next) {
    try {
      const v = new Validator(req.body, {
        userId: 'required|integer',
        email: 'required|email'
      })
      const matched = await v.check()
      if (!matched) {
        res.status(422).json({ error: true, message: MESSAGES.VALIDATION_ERROR, validation_error: v.errors })
        return;
      } else {
        const user = await User.findOne({ where: { id: req.body.userId, email: req.body.email } })
        if (typeof user !== 'undefined' && user !== null) {
          if (user.status === STATUS.BLOCK) {
            res.status(423).json({ error: true, message: MESSAGES.ACCOUNT_BLOCK })
          } else {
            let time = Helper.checkResendCodeTime(user.resend_code_time)
            if (time === RESEND_CODE_TIME.ACCOUNT_BLOCK) {
              await user.update({ verification_code: null, resend_code_time: time, status: STATUS.BLOCK })
              res.status(423).json({ error: true, message: MESSAGES.ACCOUNT_BLOCK })
            } else {
              // const checkUserResendCodeHowManyTimeInOneDay = await User.findOne({
              //   where: {
              //     id: user.id, updatedAt: { [Op.gte]: moment().subtract(30, 'minute').toDate() }
              //   },
              //   attributes: ['id', 'resend_code_date']
              // })
              // console.log(checkUserResendCodeHowManyTimeInOneDay.resend_code_date)
              let code = Math.floor(1000 + Math.random() * 9000);
              let subject = "GlobalHome Verification Code";
              let bodyOfMail = '<p>Hi ' + user.name + ', </p>' +
                '<p>Global Home new account verificaiton code is <b>' + code + '</b></p>.' +
                '<p>Thank You</p>' +
                '<p>GlobalHome</p>';
              const mail = Helper.sendMail(subject, bodyOfMail, user.email);
              if (mail) {
                await user.update({ verification_code: code, resend_code_time: time, resend_code_date: Date.now() })
                res.status(200).json({ error: false, message: MESSAGES.SENT_VERIFICATION_CODE });
              } else {
                res.status(400).json({ error: true, message: MESSAGES.EMAIL_SERVER_ERROR })
              }
            }
          }
        } else {
          res.status(404).json({ error: true, message: "User not found." });
        }
      }
    } catch (error) {
      next(error);
    }
  }

  // //Resend verification code
  // async resendCode(req, res, next) {
  //   try {
  //     //resend 4 digit verification code on user email
  //     var fourDigitCode = Math.floor(1000 + Math.random() * 9000);

  //     //Resend Verification code for verification
  //     const responsevc = await helper.resend(req, fourDigitCode);

  //     //Send Email
  //     var subject = "GlobalHome Verification Code";
  //     var bodyOfMail = "Global Home new account verificaiton code is :" + fourDigitCode;
  //     await sendMail(subject, bodyOfMail, req.email);

  //     if (responsevc.status) {
  //       res.status(200).json({
  //         statusCode: 200,
  //         status: "success",
  //         message: "verificaiton code sent successfully.",
  //         data: null,
  //       });
  //     } else {
  //       res.status(400).json({
  //         statusCode: 400,
  //         status: "error",
  //         message: "Error sending verification code",
  //         data: null,
  //       });
  //     }
  //   } catch (error) {
  //     next(error);
  //   }
  // }

  //Authenticate User
  static async authenticate(req, res, next) {
    try {
      const v = new Validator(req.body, {
        email: 'required|email',
        password: 'required|minLength:7'
      })
      const matched = await v.check()
      if (!matched) {
        res.status(422).json({ error: true, message: MESSAGES.VALIDATION_ERROR, validation_error: v.errors })
        return;
      } else {
        User.findOne({ where: { email: req.body.email } }).then(user => {
          if (!user) {
            res.status(404).json({
              error: true,
              message: 'You have entered an invalid email or password.'
            }); return;
          } else {
            if (user.status === STATUS.BLOCK) {
              res.status(423).json({ error: true, message: MESSAGES.ACCOUNT_BLOCK })
            } else if (user.status === STATUS.PENDING) {
              res.status(403).json({ error: true, message: "Account verification is pending." })
            } else {
              if (bcrypt.compareSync(req.body.password, user.password)) {
                let data = {
                  id: user.id,
                  name: user.name,
                  email: user.email,
                  status: user.status,
                  createdAt: user.createdAt,
                  updatedAt: user.updatedAt
                }
                let token = jwt.sign(user.dataValues, environment.JWT_SECRET_KEY, { expiresIn: environment.JWT_EXPIRY_TIME })
                res.status(200).json({
                  error: false,
                  message: "Login successfully.",
                  user: data,
                  token: token
                })
              } else {
                res.status(404).json({ error: true, message: "You have entered an invalid email or password." });
              }
            }
          }
        })
          .catch(err => {
            res.status(500).send({ error: true, message: err.message })
          });
      }
    } catch (err) {
      next(err);
    }
  }

  //Authenticate User
  // async authenticate(req, res, next) {
  //   try {
  //     console.log("authenticate called");
  //     var errors = [];

  //     var { email, password } = req.body;

  //     //both email and password missing -
  //     if (!email && !password) {
  //       return res.status(400).send({
  //         statusCode: 400,
  //         status: "error",
  //         message: [{ error: messages.EMPTY_EMAIL_PASSWORD }],
  //         data: null,
  //       });
  //     }
  //     if (!email) {
  //       errors.push({ email: messages.USER_EMPTY_EMAIL });
  //     }
  //     if (!password) {
  //       errors.push({ password: messages.USER_INVALID_PASSWORD });
  //     }

  //     if (errors.length > 0) {
  //       return res.status(400).json({
  //         statusCode: 400,
  //         status: "error",
  //         message: errors,
  //         token: null,
  //         data: null,
  //       });
  //     } else {
  //       //Fetch user details

  //       const response = await helper.isAuthenticated(email, password);

  //       if (!response.status || response.data === null) {
  //         return res.status(401).json({
  //           statusCode: 401,
  //           status: "error",
  //           message: [{ error: messages.AUTH_INVALID_LOGIN }],
  //           token: null,
  //           data: null,
  //         });
  //       } else {
  //         //Create JWT Token
  //         const newToken = await helper.createTokens(response.data.id, email, process.env.API_KEY, process.env.REFRESH_KEY);

  //         //Response -
  //         return res.status(200).json({
  //           statusCode: 200,
  //           status: "success",
  //           message: messages.AUTH_SUCCESS_LOGGEDIN,
  //           token: newToken.token,
  //           tokenExpireAt: newToken.token ? new Date(jwt.decode(newToken.token).exp * 1000) : "",
  //           refreshToken: newToken.refreshToken,
  //           refreshTokenExpireAt: newToken.refreshToken ? new Date(jwt.decode(newToken.refreshToken).exp * 1000) : "",
  //           data: {
  //             user: {
  //               id: response.data.id,
  //               fullname: response.data.fullname,
  //               email: response.data.email,
  //               rememberToken: null,
  //               notifications: 0,
  //               lastLogin: null,
  //               status: response.data.status,
  //               createdAt: Date.now(),
  //               updatedAt: Date.now(),
  //             },
  //           },
  //         });
  //       }
  //     }
  //   } catch (err) {
  //     console.log("Catch Error", err);
  //     next(err);
  //   }
  // }

  // Forgot Password
  static async forgotPassword(req, res, next) {
    try {
      const v = new Validator(req.body, {
        email: 'required|email'
      })
      const matched = await v.check()
      if (!matched) {
        res.status(422).json({ error: true, message: "Email field is required." })
        return;
      } else {
        const user = await User.findOne({
          where: { email: req.body.email },
          attributes: ['id', 'name', 'verification_code', 'resend_code_time', 'email']
        })
        if (typeof user !== 'undefined' && user !== null) {
          if (user.status === STATUS.BLOCK) {
            res.status(423).json({ error: true, message: MESSAGES.ACCOUNT_BLOCK })
          } else if (user.status === STATUS.PENDING) {
            res.status(403).json({ error: true, message: "Account verification is pending." })
          } else {
            let time = Helper.checkResendCodeTime(user.resend_code_time)
            if (time === RESEND_CODE_TIME.ACCOUNT_BLOCK) {
              await user.update({ verification_code: null, resend_code_time: time, status: STATUS.BLOCK })
              res.status(423).json({ error: true, message: MESSAGES.ACCOUNT_BLOCK })
            } else {
              let code = Math.floor(1000 + Math.random() * 9000);
              let subject = "GlobalHome Password Reset";
              let bodyOfMail = '<p>Hi ' + user.name + ',' +
                '</p><p>You are receiving this email because we received a password reset request for your account.</p>' +
                '<p>If you did not request a password reset, no further action is required.</p>' +
                `<p>Veridication code: <b>${code}</b>.</p>` +
                '<p>If you don’t use this verification code within 1 hour, it will expire.</p>' +
                '<p>Thank You</p>' +
                '<p>GlobalHome</p>';
              const mail = Helper.sendMail(subject, bodyOfMail, user.email);
              if (mail) {
                await user.update({
                  verification_code: code, resend_code_time: time, resend_code_date: Date.now(), forgot_password_date: Date.now()
                })
                res.status(200).json({
                  error: false,
                  message: MESSAGES.SENT_VERIFICATION_CODE,
                  userId: user.id
                });
              } else {
                res.status(400).json({ error: true, message: MESSAGES.EMAIL_SERVER_ERROR });
              }
            }
          }
        } else {
          res.status(401).json({ error: true, message: "Email not found." });
        }
      }
    } catch (ex) {
      next(ex);
    }
  }

  // Change password with verification code
  static async setPasswordWithVerifyCode(req, res, next) {
    try {
      const v = new Validator(req.body, {
        userId: 'required|integer',
        password: 'required|minLength:7',
        confirm_password: 'required|minLength:7',
        verification_code: 'required|minLength:4'
      })
      const matched = await v.check()
      if (!matched) {
        res.status(422).json({ error: true, message: MESSAGES.VALIDATION_ERROR, validation_error: v.errors })
        return;
      } else {
        const checkOTPRightOrWrong = await User.findOne({
          where: {
            id: req.body.userId, verification_code: req.body.verification_code, status: STATUS.ACTIVE
          },
          attributes: ['id', 'verification_code']
        })
        if (typeof checkOTPRightOrWrong !== 'undefined' && checkOTPRightOrWrong !== null) {
          const user = await User.findOne({
            where: {
              id: checkOTPRightOrWrong.id, verification_code: checkOTPRightOrWrong.verification_code,
              forgot_password_date: { [Op.gte]: moment().subtract(60, 'minute').toDate() }
            },
            attributes: ['id', 'verification_code']
          })
          if (typeof user !== 'undefined' && user !== null) {
            if (req.body.password === req.body.confirm_password) {
              bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(req.body.password, salt, async (err, hash) => {
                  if (err) {
                    res.status(500).json({ error: true, message: err })
                  } else {
                    await user.update({ password: hash, verification_code: null, resend_code_time: RESEND_CODE_TIME.ACCOUNT_WARNING_ONE })
                    res.status(200).json({ error: false, message: "Password changed successfully." })
                  }
                })
              })
            } else {
              res.status(401).json({ error: true, message: "New password and confirm password did not matched." })
            }
          } else {
            await checkOTPRightOrWrong.update({ verification_code: null, resend_code_time: RESEND_CODE_TIME.ACCOUNT_WARNING_ONE })
            res.status(500).json({ error: true, message: MESSAGES.VERIFICATION_CODE_EXPIRED })
          }
        } else {
          res.status(500).json({ error: true, message: MESSAGES.VERIFICATION_CODE_WRONG })
        }
      }
    } catch (error) {
      next(error);
    }
  }


}

export default UserController
