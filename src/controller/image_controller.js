import flow from "flow";
import { environment } from "../config/environment";
const AWS = require('aws-sdk');


const s3 = new AWS.S3(environment.awsS3credentials),
    result = {
        error: 0,
        uploaded: []
    };;


// Models
import db from '../models';
const GlobalIcon = db.global_icon;

class ImageController {
    create(req, res, next) {
        const file = req.file;
        flow.exec(
            function (err, data) { // Upload file to S3
                s3.putObject({
                    Bucket: 'ghhome-upload-image', //Bucket Name
                    Key: file.originalname, //Upload File Name, Default the original name
                    Body: file.buffer,
                    ACL: 'public-read',

                }, this);
            },
            function (err, data) { //Upload Callback
                if (err) {
                    console.error('Error : ' + err);
                    result.error++;
                }
                result.uploaded.push(data.ETag);
                this();
            },
            function () {
                if (result.error > 0) {
                    console.log("Unable to upload file to s3", result.error);
                    res.statusCode(500).json({
                        data: null,
                        status: 500,
                        message: "Unable to upload file on s3"
                    });
                } else {
                    try {
                        GlobalIcon.create({
                            image_url: `https://ghhome-upload-image.s3.us-east-2.amazonaws.com/${file.originalname}` ,
                            label: file.originalname,
                            fk_id: req.body.fk_id || null
                        }).then((data) => {
                            res.status(200).json({
                                statusCode: 200,
                                status: "success",
                                data: data
                            });
                        });
                    } catch {

                    }
                }

            });


    }

}
module.exports = new ImageController();