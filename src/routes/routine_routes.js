import express from "express";
import helper from "../utilis/helper"
import RoutineController from "../controller/routine_controller";

const routineRoutes = express.Router();

routineRoutes.post("/bulk", RoutineController.bulk); // create or update room's
routineRoutes.post("", RoutineController.create); // create or update room's
routineRoutes.put("", RoutineController.update); // create or update room's
routineRoutes.get("", helper.validateToken, RoutineController.list); // create or update room's
routineRoutes.delete("", RoutineController.delete); // create or update room's

module.exports = routineRoutes;