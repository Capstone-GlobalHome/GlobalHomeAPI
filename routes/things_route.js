import express from "express"
// import helper from "../utilis/helper"
import thingsController from "../controller/things_controller"

const thingsRoute = express.Router();

thingsRoute.post("/create", thingsController.create); // create or update room's
thingsRoute.put("/create", thingsController.update); //  update room's
thingsRoute.post("/list", thingsController.getThingsInRooms); //  get things in rooms room's
thingsRoute.get("/list/:parentId", thingsController.getChildThings); //  get things detail room's
thingsRoute.get("/:id", thingsController.getThing); //  get detail of particular thing 
thingsRoute.delete("/delete/:id", thingsController.delete); //  update room's


module.exports = thingsRoute;
