import express from "express";
import user from "./user";
import property_unit_routes from "./property_unit_routes";
import rooms from "./rooms_routes";
import home from "./home_routes";
import things from "./things_route";
import image from "./image_routes";
const router = express.Router();

router.use("/user", user);
router.use("/properties", property_unit_routes);
router.use("/rooms", rooms);
router.use("/home", home);
router.use("/image-icon", image)
router.use("/things", things);



export default router;
