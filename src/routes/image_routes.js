import express from "express";
import ImageController from "../controller/image_controller";

const imageRoute = express.Router();

import multer from "multer";
var storage = multer.memoryStorage();
var upload = multer({ storage: storage });
// var upload =  multer({
// 	dest: 'uploads/'
// });


imageRoute.post("/create", upload.single("image"), ImageController.create); // create or update room's

module.exports = imageRoute;