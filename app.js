import express from "express";
import bodyParser from "body-parser";
import multer from 'multer'
import AWS from 'aws-sdk'
import uuid from 'uuid/v4'
const app = express();
import Helper from "./utilis/helper";
import cors from "cors";

import swaggerUi from "swagger-ui-express";
import swaggerDocument from "./swagger.json";

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.json({ message: "Welcome to Global Homes App" });
});

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_SES_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SES_SECRET_ACCESS_KEY
})
const storage = multer.memoryStorage({
  destination: function (req, file, cb) {
    cb(null, '')
  }
})
const upload = multer({ storage }).single('image')
app.post("/upload", upload, (req, res) => {
  if (req.file) {
    const fileName = req.file.originalname.split(".")
    const fileType = fileName[fileName.length - 1]
    const fileExt = ['jpg', 'JPG', 'jpeg', 'JPEG', 'png', 'PNG', 'gif', 'GIF']
    if (fileExt.includes(fileType)) {
      const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `${uuid()}.${fileType}`,
        Body: req.file.buffer
      }
      s3.upload(params, (err, data) => {
        if (!err) {
          res.status(200).json({ error: false, message: "File uploaded successfully.", data: data })
        } else {
          res.statue(500).json({ error: true, message: err })
        }
      })
    } else {
      res.status(422).json({ error: true, message: "Only image files are allowed." })
    }
  } else {
    res.status(500).json({ error: true, message: "Image file is required." })
  }
});
app.get('/s3-bucket-image/get/:imageId', (req, res) => {
  async function getImage() {
    const data = s3.getObject({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: req.params.imageId
    }).promise()
    return data
  }
  getImage().then((img) => {
    let image = "<img src='data:image/jpeg;base64," + encode(img.Body) + "'" + "/>";
    let startHTML = "<html><body></body>";
    let endHTML = "</body></html>";
    let html = startHTML + image + endHTML;
    res.send(html)
  })
  function encode(data) {
    let buf = Buffer.from(data)
    let base64 = buf.toString('base64')
    return base64
  }
})
app.post('/ses-sendmail', (req, res) => {
  const subject = "SES Email"
  sendMail("ABC", req.body.email, subject, async (err, result) => {
    if (!err) {
      result.then(async data => {
        res.status(200).json({ error: false, message: "Email sent successfully.", data: data })
      })
    } else {
      res.status(500).json({ error: true, message: err });
    }
  })
})
const sendMail = (receiverName, email, subject, cb) => {
  const emailFormat = "<html><body><p>Hi " + receiverName + ",</p><p>You have receive new request from " + 'Rajinder' + " in GLOBAL HOME.</p> <p>Sincerely,</p> <p>Team GLOBAL HOME</p></body></html>"
  AWS.config.update({
    accessKeyId: process.env.AWS_SES_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SES_SECRET_ACCESS_KEY,
    region: process.env.AWS_SES_REGION
  })
  const ses = new AWS.SES({ apiVersion: "2012-10-17" })
  const params = {
    Destination: {
      ToAddresses: [email] // Email address/addresses that you want to send your email
    },
    ConfigurationSetName: "ses-ghhome", //<<ConfigurationSetName>>
    Message: {
      Body: {
        Html: { Charset: "UTF-8", Data: emailFormat }
      },
      Subject: { Charset: "UTF-8", Data: subject }
    },
    Source: "systems@myglobalhome.co"
  }
  const sendEmail = ses.sendEmail(params).promise()
  cb(null, sendEmail)
}

app.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

//CORS middleware
const allowCrossDomain = (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type, authorization,x-access-token,apikey");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,PATCH,OPTIONS");
  next();
};

app.use(allowCrossDomain);
app.use(cors());

// app.use(helper.tokenVerify);
// app.use(helper.auth);

//Get Routes
import routes from "./routes/";
import { includes } from "lodash";
app.use("/", routes);

// express doesn't consider not found 404 as an error so we need to handle 404 explicitly
// handle 404 error
app.use((req, res, next) => {
  let err = new Error("Not Found");
  err.status = 404;
  next(err);
});

// handle errors
app.use((err, req, res, next) => {
  if (err.status === 404) {
    res.status(404).json({
      status: "error",
      message: [{ error: "Not found, " + err.message }],
      data: null,
    });
  } else {
    res.status(500).json({
      status: "error",
      message: [{ error: "Something looks wrong, " + err.message }],
      data: null,
    });
  }
});

export default app;
