import {UserRole} from "@prisma/client";
import express from "express";
import auth from "../../middlewares/auth";

import multer from "multer";
import {createStorage} from "../../../helpars/fileUploader";
import {vendorController} from "./vendor.controller";

const event = multer({
    storage: createStorage("event-file"),
});

const uploadEventFiles = event.fields([
    {name: "event-file", maxCount: 5},
    {name: "gear-file", maxCount: 4},
]);

const router = express.Router();

// user login route
router.post("/create-events", auth(UserRole.VENDOR), uploadEventFiles, vendorController.createEvents);
router.get("/get-all-events-for-vendor", auth(UserRole.VENDOR), vendorController.getAllEventsForVendor);

export const VendorRoutes = router;