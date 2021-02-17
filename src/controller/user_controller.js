"use strict";

import { Validator } from 'node-input-validator'
import moment from "moment"
import Sequelize from "sequelize"
import _ from "lodash"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import Helper from "../utilis/helper"
import { environment } from "../config/environment"
import { STATUS, RESEND_CODE_TIME, MESSAGES } from "../constants/user.constant"
// Models
import db from '../models'
const Op = Sequelize.Op;
const User = db.User

class UserController {
  //SignUp New User
  async create(req, res, next) {
    try {
      const v = new Validator(req.body, {
        name: 'required',
        email: 'required|email',
        password: 'required|minLength:8'
      })
      const matched = await v.check()
      if (!matched) {
        const errors = _.map(v.errors, value => value.message);
        res.status(422).json({
          statusCode: 422,
          status: "error",
          message: errors,
          data: null
        })
        // statusCode: 200,
        // status: "success",
        // message: "Thing config created successfully.",
        // data: config

      } else {
        User.findOne({ where: { email: req.body.email } }).then(result => {
          if (result) {
            res.status(409).json(
              {
                statusCode: 409,
                status: "error",
                message: `${req.body.email} : already exists.`,
                data: null
              });
          } else {
            bcrypt.genSalt(10, async (err, salt) => {
              bcrypt.hash(req.body.password, salt, async (err, hash) => {
                if (err) {
                  res.status(500).json({
                    statusCode: 500,
                    status: "error",
                    message: err,
                    data: null
                  });
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
                        statusCode: 200,
                        status: "success",
                        message: MESSAGES.SENT_VERIFICATION_CODE,
                        data: {
                          "id": user.id,
                          "name": user.name,
                          "email": user.email,
                          "status": user.status,
                          "avatar": ''
                        }
                      });
                    });
                  } else {
                    res.status(400).json(
                      {
                        statusCode: 400,
                        status: "error",
                        message: MESSAGES.EMAIL_SERVER_ERROR,
                        data: null
                      })
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

  //Verify verification code
  async verifyCode(req, res, next) {
    try {
      const v = new Validator(req.body, {
        userId: 'required',
        verification_code: 'required|minLength:4'
      })
      const matched = await v.check()
      if (!matched) {
        const errors = _.map(v.errors, value => value.message);
        res.status(422).json({
          statusCode: 422,
          status: "error",
          message: errors,
          data: null
        });
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
            let token = jwt.sign(user.dataValues, environment.JWT_SECRET_KEY, { expiresIn: environment.JWT_EXPIRY_TIME });

            let refreshToken = jwt.sign(user.dataValues, environment.REFRESH_KEY, { expiresIn: environment.JWT_REFERESH_TIME });

            res.status(200).json({
              statusCode: 200,
              status: "success",
              message: "User verified successfully.",
              user: data,
              token: token,
              tokenExpireAt: token ? new Date(jwt.decode(token).exp * 1000) : "",
              refreshToken: refreshToken,
              refreshTokenExpireAt: refreshToken ? new Date(jwt.decode(refreshToken).exp * 1000) : "",
            })
          } else {
            await User.update({ verification_code: null, resend_code_time: RESEND_CODE_TIME.SIGNUP_CODE }, { where: { id: checkOTPRightOrWrong.id } })
            res.status(500).json({
              statusCode: 500,
              status: "error",
              data: null,
              message: MESSAGES.VERIFICATION_CODE_EXPIRED
            })
          }
        } else {
          res.status(500).json(
            {
              statusCode: 500,
              status: "error",
              data: null,
              message: MESSAGES.VERIFICATION_CODE_WRONG
            })
        }
      }
    } catch (error) {
      next(error);
    }
  }

  //Resend verification code
  async resendCode(req, res, next) {
    try {
      let v = new Validator(req.body, {
        email: 'required'
      });
      const matched = await v.check()
      if (!matched) {
        const errors = _.map(v.errors, value => value.message);
        res.status(422).json({
          statusCode: 422,
          status: "error",
          message: errors,
          data: null
        });
      } else {
        const user = await User.findOne({ where: { email: req.body.email } })
        if (typeof user !== 'undefined' && user !== null) {
          if (user.status === STATUS.BLOCK) {
            res.status(423).json({
              statusCode: 423,
              status: "error",
              data: null,
              message: MESSAGES.ACCOUNT_BLOCK
            })
          } else {
            let time
            if (req.body.isForgotPassword) {
              time = user.resend_code_time;
            } else {
              time = Helper.checkResendCodeTime(user.resend_code_time)
            }
            if (time === RESEND_CODE_TIME.ACCOUNT_BLOCK) {
              await user.update({ verification_code: null, resend_code_time: time, status: STATUS.BLOCK })
              res.status(423).json({
                statusCode: 423,
                status: "error",
                data: null,
                message: MESSAGES.ACCOUNT_BLOCK
              })
            } else {
              let code = Math.floor(1000 + Math.random() * 9000);
              let subject = "GlobalHome Verification Code";
              let bodyOfMail = '<p>Hi ' + user.name + ', </p>' +
                '<p>Global Home new account verificaiton code is <b>' + code + '</b></p>.' +
                '<p>Thank You</p>' +
                '<p>GlobalHome</p>';
              const mail = Helper.sendMail(subject, bodyOfMail, user.email);
              if (mail) {
                await user.update({ verification_code: code, resend_code_time: time, resend_code_date: Date.now() })
                res.status(200).json({
                  statusCode: 200,
                  status: "success",
                  message: MESSAGES.SENT_VERIFICATION_CODE,
                  data: null
                });
              } else {
                res.status(400).json({
                  statusCode: 422,
                  status: "error",
                  data: null,
                  message: MESSAGES.EMAIL_SERVER_ERROR
                })
              }
            }
          }
        } else {
          res.status(404).json({
            statusCode: 422,
            status: "error",
            data: null,
            message: "User not found."
          });
        }
      }
    } catch (error) {
      next(error);
    }
  }

  //Authenticate User
  async authenticate(req, res, next) {
    try {
      const v = new Validator(req.body, {
        email: 'required|email',
        password: 'required|minLength:8'
      })
      const matched = await v.check()
      if (!matched) {
        const errors = _.map(v.errors, value => value.message);
        res.status(422).json({
          statusCode: 422,
          status: "error",
          message: errors,
          data: null
        })

      } else {
        User.findOne({ where: { email: req.body.email } }).then(user => {
          if (!user) {
            res.status(404).json({
              statusCode: 404,
              status: "error",
              data: null,
              message: 'You have entered an invalid email or password.'
            }); return;
          } else {
            if (user.status === STATUS.BLOCK) {
              res.status(423).json({
                statusCode: 423,
                status: "error",
                data: null, message: MESSAGES.ACCOUNT_BLOCK
              })
            } else if (user.status === STATUS.PENDING) {
              res.status(403).json({
                statusCode: 403,
                status: "error",
                data: { email: user.email, userId: user.id },
                message: "Account verification is pending."
              })
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

                let refreshToken = jwt.sign(user.dataValues, environment.REFRESH_KEY, { expiresIn: environment.JWT_REFERESH_TIME });

                res.status(200).json({
                  statusCode: 200,
                  status: "success",
                  message: "Login successfully.",
                  user: data,
                  token: token,
                  tokenExpireAt: token ? new Date(jwt.decode(token).exp * 1000) : "",
                  refreshToken: refreshToken,
                  refreshTokenExpireAt: refreshToken ? new Date(jwt.decode(refreshToken).exp * 1000) : "",

                })
              } else {
                res.status(404).json({
                  statusCode: 404,
                  status: "error",
                  data: null,
                  message: "You have entered an invalid email or password."
                });
              }
            }
          }
        })
          .catch(err => {
            res.status(500).send({
              statusCode: 500,
              status: "error",
              data: null, message: err.message
            })
          });
      }
    } catch (err) {
      next(err);
    }
  }

  // Forgot Password
  async forgotPassword(req, res, next) {
    try {
      const v = new Validator(req.body, {
        email: 'required|email'
      })
      const matched = await v.check()
      if (!matched) {
        const errors = _.map(v.errors, value => value.message);
        res.status(422).json({
          statusCode: 422,
          status: "error",
          message: errors,
          data: null
        })
      } else {
        const user = await User.findOne({
          where: { email: req.body.email },
          attributes: ['id', 'name', 'verification_code', 'resend_code_time', 'email']
        })
        if (typeof user !== 'undefined' && user !== null) {
          if (user.status === STATUS.BLOCK) {
            res.status(423).json({
              statusCode: 423,
              status: "error",
              data: null, message: MESSAGES.ACCOUNT_BLOCK
            })
          } else if (user.status === STATUS.PENDING) {
            res.status(403).json({
              statusCode: 403,
              status: "error",
              data: null, message: "Account verification is pending."
            })
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
                verification_code: code, forgot_password_date: Date.now()
              })

              res.status(200).json({
                statusCode: 200,
                status: "success",
                message: MESSAGES.SENT_VERIFICATION_CODE,
                userId: user.id
              });
            } else {
              res.status(400).json({
                statusCode: 400,
                status: "error",
                data: null, message: MESSAGES.EMAIL_SERVER_ERROR
              });
            }
          }
        } else {
          res.status(401).json({
            statusCode: 401,
            status: "error",
            data: null, message: "Email does not exist."
          });
        }
      }
    } catch (ex) {
      next(ex);
    }
  }

  // Change password with verification code
  async setPasswordWithVerifyCode(req, res, next) {
    try {
      const v = new Validator(req.body, {
        email: 'required|email',
        password: 'required|minLength:8',
        confirm_password: 'required|minLength:8',
        verification_code: 'required|minLength:4'
      })
      const matched = await v.check()
      if (!matched) {
        const errors = _.map(v.errors, value => value.message);
        res.status(422).json({
          statusCode: 422,
          status: "error",
          message: errors,
          data: null
        })
      } else {
        const checkOTPRightOrWrong = await User.findOne({
          where: {
            email: req.body.email, verification_code: req.body.verification_code, status: STATUS.ACTIVE
          },
          attributes: ['id', 'email', 'verification_code']
        })
        if (typeof checkOTPRightOrWrong !== 'undefined' && checkOTPRightOrWrong !== null) {
          const user = await User.findOne({
            where: {
              email: checkOTPRightOrWrong.email, verification_code: checkOTPRightOrWrong.verification_code,
              forgot_password_date: { [Op.gte]: moment().subtract(60, 'minute').toDate() }
            },
            attributes: ['id', 'verification_code']
          })
          if (typeof user !== 'undefined' && user !== null) {
            if (req.body.password === req.body.confirm_password) {
              bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(req.body.password, salt, async (err, hash) => {
                  if (err) {
                    res.status(500).json({
                      statusCode: 404,
                      status: "error",
                      data: null, message: err
                    })
                  } else {
                    await user.update({ password: hash, verification_code: null })
                    res.status(200).json({
                      statusCode: 200,
                      status: "success",
                      data: null, message: "Password changed successfully."
                    })
                  }
                })
              })
            } else {
              res.status(401).json({
                statusCode: 401,
                status: "error",
                data: null, message: "New password and confirm password did not matched."
              })
            }
          } else {
            await checkOTPRightOrWrong.update({ verification_code: null })
            res.status(500).json({
              statusCode: 500,
              status: "error",
              data: null, message: MESSAGES.VERIFICATION_CODE_EXPIRED
            })
          }
        } else {
          res.status(500).json({
            statusCode: 500,
            status: "error",
            data: null, message: MESSAGES.VERIFICATION_CODE_WRONG
          })
        }
      }
    } catch (error) {
      next(error);
    }
  }

  async setUserUnitID(req, res, next) {
    try {
      const v = new Validator(req.body, {
        userId: 'required',
        unitId: 'required'
      })
      const matched = await v.check()
      if (!matched) {
        const errors = _.map(v.errors, value => value.message);
        res.status(422).json({
          statusCode: 422,
          status: "error",
          message: errors,
          data: null
        })
      } else {
        let { userId, unitId } = req.body;
        User.findByPk(userId).then(result => {
          if (!result) {
            res.status(404).json({
              status: "error",
              message: "No User found with userId:" + userId,
              statusCode: 404
            });
          } else {
            result.update({ 'fk_unit_id': unitId }).then(user => {
              res.status(200).json({
                statusCode: 200,
                status: "success",
                message: "User info updated",
                data: user
              })
            });
          }
        });
      }
    } catch (error) {
      next(error);
    }

  }


  async getUserDetail(req, res, next) {
    try {
      const userId = req.user.id;
      User.findByPk(userId).then(user => {
        if (!user) {
          res.status(404).json({
            status: "error",
            message: "No user information found:" + userId,
            statusCode: 404
          });
        } else {
          res.status(200).json({
            statusCode: 200,
            status: "success",
            message: "User information detail.",
            data: {
              id: user.id,
              name: user.name,
              email: user.email,
              status: user.status,
              avatar: "http://104.237.5.179:4000/avatar.png",
              createdAt: user.createdAt,
              updatedAt: user.updatedAt
            }
          });
        }
      });

    } catch (error) {
      next(error);
    }

  }


}

module.exports = new UserController();
