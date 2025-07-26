import catchAsync from "../../../shared/catchAsync";
import {Request, Response} from "express";
import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";
import {adminService} from "./admin.service";
import {vendorService} from "../Vendor/vendor.service";

const getAllVendors = catchAsync(async (req: Request, res: Response) => {

    const data = await adminService.getAllVendors(req);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Get all vendors successfully",
        data: data,
    });
});


const approveVendor = catchAsync(async (req: Request, res: Response) => {

    const id = req.params.id;
    const status = req.body.status;

    const data = await adminService.approveVendor(id, status);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Vendor approval status updated successfully",
        data: data,
    });
});

const getAllEventsForAdmin = catchAsync(async (req: Request, res: Response) => {
    const userId = req.params.id; // Assuming user ID is available in the request object

    const result = await vendorService.getAllEventsForVendor(userId, req);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Events retrieved successfully",
        data: result,
    });
})


const getEventDetails = catchAsync(async (req: Request, res: Response) => {
    const eventId = req.params.id;

    const result = await adminService.getEventDetails(eventId);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Event details retrieved successfully",
        data: result,
    });
})

const approveEvents = catchAsync(async (req: Request, res: Response) => {
    const eventId = req.params.id;
    const isAccepted = req.body.isAccepted;

    const result = await adminService.approveEvents(eventId, isAccepted);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Event approval status updated successfully",
        data: result,
    });
})


const removeCompletedEvents = catchAsync(async (req: Request, res: Response) => {
    const eventId = req.params.id;

    const result = await adminService.removeCompletedEvents(eventId);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Event approval status updated successfully",
        data: result,
    });
})


export const adminController = {
    getAllVendors,
    approveVendor,
    getAllEventsForAdmin,
    getEventDetails,
    approveEvents,
    removeCompletedEvents
}