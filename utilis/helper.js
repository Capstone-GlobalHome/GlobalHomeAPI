import sendgrid from "@sendgrid/mail"
// import { Validator } from 'node-input-validator'
import { RESEND_CODE_TIME } from "../constants/user.constant"
import { environment } from '../config/environment'

class Helper {
  //Send email via provider
  static async sendMail(subject, bodyOfMail, receiverMailId) {
    sendgrid.setApiKey(environment.SENDGRID_APIKEY);
    const msg = {
      to: receiverMailId,
      from: environment.SENDER_EMAIL,
      subject: subject,
      html: bodyOfMail,
    };
    await (() => {
      sendgrid
        .send(msg)
        .then(() => {
          return true
        })
        .catch((error) => {
          return false
        });
    })();
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
    console.log("auth")
    if (req.auth.check()) {
      next();
    } else {
      console.log("error",req.auth);
      res.status(401).json({
        status: "error",
        message: [{ error: req.jwtError && req.jwtError.message == "jwt expired" ? req.jwtError.message : "Could not validate the token" }],
        data: null,
      });
    }
  };


}

export default Helper
