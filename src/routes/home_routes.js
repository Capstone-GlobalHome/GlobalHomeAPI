import express from "express"
import helper from "../utilis/helper"
import homeController from "../controller/home_controller"

const roomsRoute = express.Router();


roomsRoute.post("/view", helper.validateToken, homeController.prepareHome); // create or update room's
roomsRoute.post("/features", homeController.create); // create or update room's
roomsRoute.get("/features", homeController.getFeatures); //  update room's
roomsRoute.put("/features", homeController.update); //  update room's
roomsRoute.delete("/features", homeController.delete); //  update room's
roomsRoute.get("/features/:featureId", helper.validateToken, homeController.getAllChildren); //  update room's
roomsRoute.post("/addShortcuts", helper.validateToken, homeController.addShortCuts); // create or update room's
roomsRoute.get("/userShortcuts", homeController.getUserShortCuts); // create or update room's


module.exports = roomsRoute;
