import {Request, Response} from "express";
import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import {vendorService} from "./vendor.service";
import ApiError from "../../../errors/ApiErrors";
import {eventValidation} from "./vendor.validation";

const createEvents = catchAsync(async (req: Request, res: Response) => {

    const userId = req.user.id; // Assuming user ID is available in the request object


    const data = req.body.data && JSON.parse(req.body.data)

    const address = data.address
    const longitude1 = parseFloat(data.longitude)
    const latitude2 = parseFloat(data.latitude)

    const location = {
        "type": "Point",
        "address": address,
        "coordinates": [
            longitude1,
            latitude2
        ]
    }

    if (!req.files || typeof req.files !== "object" || Array.isArray(req.files)) {
        throw new ApiError(httpStatus.EXPECTATION_FAILED, "Invalid file upload data.");
    }

    const eventsFiles = req.files["event-file"] as Express.Multer.File[] | undefined;
    const gearFiles = req.files["gear-file"] as Express.Multer.File[] | undefined;

    let gearImages;

    if (gearFiles){
        gearImages = gearFiles?.map(
            (file) => `${process.env.BACKEND_IMAGE_URL}/gear-file/${file.filename}`
        ) || [];

    }


    const files = eventsFiles?.map(
        (file) => `${process.env.BACKEND_IMAGE_URL}/event-file/${file.filename}`
    ) || [];

    if (files.length === 0) {
        throw new ApiError(httpStatus.EXPECTATION_FAILED, "No files uploaded.");
    }

    const {longitude, latitude, ...newData} = data

    const dataWithFiles = {
        ...newData,
        location,
        eventImages: files,
    }

    const validationResult = eventValidation.EventSchema.safeParse(dataWithFiles);

    if (!validationResult.success) {
        return res.status(httpStatus.BAD_REQUEST).json({
            success: false,
            message: "Validation Error",
            errors: validationResult.error.errors,
        });
    }

    const result = await vendorService.createEvents(userId, dataWithFiles);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Event created successfully",
        data: result,
    });
});

const getAllEventsForVendor = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user.id; // Assuming user ID is available in the request object

    const result = await vendorService.getAllEventsForVendor(userId, req);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Events retrieved successfully",
        data: result,
    });
})

export const vendorController = {
    createEvents,
    getAllEventsForVendor
}