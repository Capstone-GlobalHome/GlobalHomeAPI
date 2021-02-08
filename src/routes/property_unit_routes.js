import express from "express"
// import helper from "../utilis/helper"
import propertiesUnitController from "../controller/property_unit_controller"

const propertyUnitRoutes = express.Router();

propertyUnitRoutes.get("/:propertyId/buildings/:buildingId/units", propertiesUnitController.getUnits); // get all units unit's
propertyUnitRoutes.post("/:propertyId/buildings/:buildingId/units", propertiesUnitController.create); // create or update unit's
propertyUnitRoutes.get("/units/:unitId", propertiesUnitController.getUnitsById); // create or update unit's
propertyUnitRoutes.put("/units/:unitId", propertiesUnitController.updateUnit); // create or update unit's
propertyUnitRoutes.delete("/units/:unitId", propertiesUnitController.deleteUnit); // create or update unit's


export default propertyUnitRoutes;
