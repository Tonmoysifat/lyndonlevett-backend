import catchAsync from "../../../shared/catchAsync";
import {Request, Response} from "express";
import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";
import {userService} from "./user.service";

const getAllActiveEvents = catchAsync(async (req: Request, res: Response) => {
    const result = await userService.getAllActiveEvents(req);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Active events fetched successfully",
        data: result,
    });
});

export const userController = {
    getAllActiveEvents
}
