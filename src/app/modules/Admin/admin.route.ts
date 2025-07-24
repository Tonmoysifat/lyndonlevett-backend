import express from "express";
import auth from "../../middlewares/auth";
import {adminController} from "./admin.controller";
import {UserRole} from "@prisma/client";
const router = express.Router();




router.get("/get-all-vendors", auth(UserRole.SUPER_ADMIN), adminController.getAllVendors);
router.patch("/approve-vendor/:id", auth(UserRole.SUPER_ADMIN), adminController.approveVendor);

export const AdminRoutes = router;