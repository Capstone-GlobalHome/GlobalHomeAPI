import express from "express"
// import helper from "../utilis/helper"
import roomsController from "../controller/rooms_controller"


const roomsRoute = express.Router();

roomsRoute.post("/create", roomsController.createRoom); // create or update room's
roomsRoute.put("/:roomId", roomsController.updateRoom); // create or update room's
roomsRoute.get("/:roomId", roomsController.getRoomById); // get all room's
roomsRoute.delete("/:roomId", roomsController.deleteRoom); // create or update room's
roomsRoute.get("/unit/:unitId", roomsController.getRoomByUnitID); // get all room's

module.exports= roomsRoute;
