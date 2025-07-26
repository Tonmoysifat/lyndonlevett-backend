import express from "express";
import multer from "multer";
import {createStorage} from "../../../helpars/fileUploader";
import {userController} from "./user.controller";

const partnerProfile = multer({
    storage: createStorage("ProfileFile"),
});
const uploadPartnerProfile = partnerProfile.single("profilePic");

const router = express.Router();

// user login route
router.get("/get-all-approved-events", userController.getAllActiveEvents);

export const UserRoutes = router;
