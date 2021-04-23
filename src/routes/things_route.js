import express from "express"
import helper from "../utilis/helper"
import thingsController from "../controller/things_controller"
import thingsPresetController from "../controller/things_presets_controller"
import thingsOpsController from "../controller/things_operation_controller"

const thingsRoute = express.Router();

thingsRoute.post("/create", thingsController.create); // create or update room's
thingsRoute.put("/create", thingsController.update); //  update room's
thingsRoute.post("/list", helper.validateToken, thingsController.getThingsInRooms); //  get things in rooms room's
thingsRoute.get("/list/:parentId", thingsController.getChildThings); //  get things detail room's

thingsRoute.get("/dmxlist/:parentId", thingsController.getDMX); //  get DMXs


thingsRoute.get("/mock/dmxlist/:parentId", thingsController.getMockDMXList); //  get DMXs


thingsRoute.get("/:id", thingsController.getThing); //  get detail of particular thing 
thingsRoute.delete("/delete/:id", thingsController.delete); //  update room's

//presets
thingsRoute.post("/presets", thingsPresetController.getThingsPresets)

// save presets
thingsRoute.put("/presets/save", thingsPresetController.savePresets)

//Things operation perform api
thingsRoute.post("/config/create", thingsOpsController.createThingsConfig); // create or update room's
thingsRoute.post("/mapping/create", thingsOpsController.createThingIotMappingConfig); // create or update room's

thingsRoute.post("/execute", thingsOpsController.execute); //  update room's
thingsRoute.post("/read", thingsOpsController.read); //  update room's
thingsRoute.post("/tst/cmd", thingsOpsController.tstCmd); //  update room's
thingsRoute.post("/blind/execute", thingsOpsController.writeToblinds);
thingsRoute.post("/blind/read", thingsOpsController.readBlindState);
thingsRoute.post("/dmx/execute", thingsOpsController.writeToDMX);
thingsRoute.post("/dmx/read", thingsOpsController.readDMX);
thingsRoute.post("/sensors/read", thingsOpsController.readSensors);

thingsRoute.post("/dmx/parent/execute", thingsOpsController.executeDMXParent);

thingsRoute.post("/dmx/parent", thingsController.getMockDMXList)

module.exports = thingsRoute;
