import express from "express";
import RoutineController from "../controller/routine_controller";

const routineRoutes = express.Router();




routineRoutes.post("/create", RoutineController.create); // create or update room's

module.exports = routineRoutes;