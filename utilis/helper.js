// import sendgrid from "@sendgrid/mail"
import AWS from 'aws-sdk'
import { RESEND_CODE_TIME } from "../constants/user.constant"
import { environment } from '../config/environment'
import jwt from "jsonwebtoken"

class Helper {
  //Send email via provider
  // static async sendMail(subject, bodyOfMail, receiverMailId) {
  //   sendgrid.setApiKey(environment.SENDGRID_APIKEY);
  //   const msg = {
  //     to: receiverMailId,
  //     from: environment.SENDER_EMAIL,
  //     subject: subject,
  //     html: bodyOfMail,
  //   };
  //   await (() => {
  //     sendgrid
  //       .send(msg)
  //       .then(() => {
  //         return true
  //       })
  //       .catch((error) => {
  //         return false
  //       });
  //   })();
  // }

  static async sendMail(subject, bodyOfMail, receiverMailId, cb) {
    AWS.config.update({
      accessKeyId: environment.AWS_SES_ACCESS_KEY,
      secretAccessKey: environment.AWS_SES_SECRET_ACCESS_KEY,
      region: environment.AWS_SES_REGION
    })
    const ses = new AWS.SES({ apiVersion: "2012-10-17" })
    const params = {
      Destination: {
        ToAddresses: [receiverMailId] // Email address/addresses that you want to send your email
      },
      ConfigurationSetName: "ses-ghhome", //<<ConfigurationSetName>>
      Message: {
        Body: {
          Html: { Charset: "UTF-8", Data: bodyOfMail }
        },
        Subject: { Charset: "UTF-8", Data: subject }
      },
      Source: "systems@myglobalhome.co"
    }
    const sendEmail = ses.sendEmail(params).promise()
    cb(null, sendEmail)
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


  // const s3 = new AWS.S3({
  //   accessKeyId: AWS_SES_ACCESS_KEY,
  //   secretAccessKey: AWS_SES_SECRET_ACCESS_KEY
  // })
  // app.get('/s3-bucket-image/get', (req, res) => {
  //   const query = req.query && req.query.imageKey
  //   async function getImage() {
  //     const data = s3.getObject({
  //       Bucket: AWS_BUCKET_NAME,
  //       Key: query
  //     }).promise()
  //     return data
  //   }
  //   getImage().then((img) => {
  //     res.status(200).json({ error: false, message: "Image get successfully.", data: `data:image/jpeg;base64,${encode(img.Body)}` })
  //     // let image = "<img src='data:image/jpeg;base64," + encode(img.Body) + "'" + "/>";
  //     // let startHTML = "<html><body></body>";
  //     // let endHTML = "</body></html>";
  //     // let html = startHTML + image + endHTML;
  //     // res.send(html)
  //   })
  //   function encode(data) {
  //     let buf = Buffer.from(data)
  //     let base64 = buf.toString('base64')
  //     return base64
  //   }
  // })

}

export default Helper
