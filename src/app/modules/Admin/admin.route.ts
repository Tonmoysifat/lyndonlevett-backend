import express from "express";
import auth from "../../middlewares/auth";
import {adminController} from "./admin.controller";
import {UserRole} from "@prisma/client";
const router = express.Router();




router.get("/get-all-vendors", auth(UserRole.SUPER_ADMIN), adminController.getAllVendors);
router.get("/get-all-events-for-admin/:id", auth(UserRole.SUPER_ADMIN), adminController.getAllEventsForAdmin);
router.get("/get-event-details-by-id/:id", auth(UserRole.SUPER_ADMIN), adminController.getEventDetails);
router.patch("/approve-vendor/:id", auth(UserRole.SUPER_ADMIN), adminController.approveVendor);
router.patch("/approve-events/:id", auth(UserRole.SUPER_ADMIN), adminController.approveEvents);
router.delete("/remove-events/:id", auth(UserRole.SUPER_ADMIN), adminController.removeCompletedEvents);

export const AdminRoutes = router;