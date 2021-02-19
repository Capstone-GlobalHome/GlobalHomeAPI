import sendgrid from "@sendgrid/mail"
// import { Validator } from 'node-input-validator'
import { RESEND_CODE_TIME } from "../constants/user.constant"
import { environment } from '../config/environment'


import jwt from "jsonwebtoken";
var AWS = require('aws-sdk');

class Helper {
  //Send email via provider
  static async sendMail(subject, bodyOfMail, receiverMailId) {
    // sendgrid.setApiKey(environment.SENDGRID_APIKEY);
    var params = {
      Destination: { /* required */
        ToAddresses: [
          receiverMailId,
          /* more items */
        ]
      },
      Message: { /* required */
        Body: { /* required */
          Html: {
            Charset: "UTF-8",
            Data: bodyOfMail
          }
        },
        
        Subject: {
          Charset: 'UTF-8',
          Data: subject
        }
      },
      Source: environment.SENDER_EMAIL, /* required */

    };
    // const msg = {
    //   to: receiverMailId,
    //   from: environment.SENDER_EMAIL,
    //   subject: subject,
    //   html: bodyOfMail,
    // };
    // await (() => {
    //   sendgrid
    //     .send(msg)
    //     .then(() => {
    //       return true
    //     })
    //     .catch((error) => {
    //       return false
    //     });
    // })();

    // Create the promise and SES service object

    AWS.config.update(environment.awsSendMailCredentials);
    var sendPromise = new AWS.SES({ apiVersion: '2010-12-01' }).sendEmail(params).promise();
    // Handle promise's fulfilled/rejected states
    try {
      await sendPromise;
    } catch(err) {
      console.log("error while sending mail", err.stack );
    }
    
  }
  // User can resend code only 3 time, after that user account will be blocked
  static checkResendCodeTime(codeResendTime) {
    var time = codeResendTime
    if (time === RESEND_CODE_TIME.SIGNUP_CODE) {
      time = RESEND_CODE_TIME.ACCOUNT_WARNING_ONE
    } else if (time === RESEND_CODE_TIME.ACCOUNT_WARNING_ONE) {
      time = RESEND_CODE_TIME.ACCOUNT_WARNING_TWO
    } else if (time === RESEND_CODE_TIME.ACCOUNT_WARNING_TWO) {
      time = RESEND_CODE_TIME.ACCOUNT_WARNING_TREE
    } else if (time === RESEND_CODE_TIME.ACCOUNT_WARNING_TREE) {
      time = RESEND_CODE_TIME.ACCOUNT_BLOCK
    }
    return time
  }

  // static async validateInput(body) {
  //   const v = new Validator(body, {
  //     name: 'required',
  //     email: 'required|email',
  //     password: 'required|minLength:7'
  //   })
  //   const matched = await v.check()
  //   return { matched, v }
  // }

  // createOrUpdate
  static upsert(Model, values, condition) {
    return Model.findOne({ where: condition })
      .then((obj) => {
        // update
        if (obj) {
          return obj.update(values)
        }
        // create
        return Model.create(values)
      })
  }

  static validateToken(req, res, next) {

    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if (token == null) return res.sendStatus(401).json({
      statusCode: 401,
      status: "error",
      message: "Authentication Token required",
      data: null
    })

    jwt.verify(token, environment.JWT_SECRET_KEY, (err, user) => {
      if (err) return res.sendStatus(403).json({
        statusCode: 403,
        status: "error",
        message: "Authentication Token expired or invalid",
      })
      req.user = user
      next() // pass the execution off to whatever request the client intended
    })
  };


}

export default Helper
