import sendgrid from "@sendgrid/mail";
import { RESEND_CODE_TIME } from "../constants/user.constant"

class Helper {
  //Send email via provider
  static async sendMail(subject, bodyOfMail, receiverMailId) {
    sendgrid.setApiKey(process.env.SENDGRID_ApiKey);
    const msg = {
      to: receiverMailId,
      from: process.env.SENDER_EMAILID,
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

}

export default Helper
