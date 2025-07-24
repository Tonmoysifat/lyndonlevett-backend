import catchAsync from "../../../shared/catchAsync";
import {Request, Response} from "express";
import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";
import {adminService} from "./admin.service";

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

export const adminController = {
    getAllVendors,
    approveVendor
}