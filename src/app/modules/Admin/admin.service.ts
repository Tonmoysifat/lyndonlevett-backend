import prisma from "../../../shared/prisma";
import {EventStatus, UserRole, UserStatus} from "@prisma/client";
import {paginationHelpers} from "../../../helpars/paginationHelper";
import {Request} from "express";
import apiErrors from "../../../errors/ApiErrors";
import httpStatus from "http-status";
import ApiError from "../../../errors/ApiErrors";

const getAllVendors = async (req: Request) => {
    const filters = {
        searchField: req.query.searchField as string | undefined,
        location: req.query.location as string | undefined,
        page: Number(req.query.page) || 1,
        limit: Number(req.query.limit),
    };

    const {page, limit, skip} = paginationHelpers.calculatePagination(filters);
    const whereCondition: any = {
        role: UserRole.VENDOR,
    };

    if (filters.searchField) {
        whereCondition.OR = [
            {
                fullName: {
                    contains: filters.searchField,
                    mode: "insensitive", // Case-insensitive search
                },
            },

            {
                email: {
                    equals: filters.searchField,
                },
            },
        ];
    }

    if (filters.location) {
        whereCondition.country = {
            equals: filters.location,
        };
    }

    const total = await prisma.user.count({where: whereCondition});

    const vendors = await prisma.user.findMany({
        where: whereCondition,
        orderBy: {createdAt: "desc"},
        select: {
            id: true,
            fullName: true,
            createdAt: true,
            country: true,
            email: true,
            Events: {
                select: {
                    id: true
                }
            },
            status: true,
        },
        skip,
        take: limit,
    });

    const formattedVendors = vendors.map((user) => ({
        ...user,
        totalEvents: user.Events.length,
        Events: undefined, // Exclude the rentals from the response
    }));

    return {
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
        data: formattedVendors,
    };
};

const approveVendor = async (id: string, status: UserStatus) => {
    const isVendorExists = await prisma.user.findUnique({
        where: {id, role: UserRole.VENDOR},
    })

    if (!isVendorExists) {
        throw new Error("Vendor not found");
    }

    const updatedVendor = await prisma.user.update({
        where: {id},
        data: {status},
    });

    return updatedVendor;

}

const getEventDetails = async (id: string) => {

    const eventDetails = await prisma.events.findUnique({
        where: {id},
        include: {
            Gear: true
        }
    });

    if (!eventDetails) {
        throw new apiErrors(httpStatus.NOT_FOUND, "Event not found");
    }

    return eventDetails;
}

const approveEvents = async (id: string, isAccepted: boolean) => {

    const isEventExists = await prisma.events.findUnique({
        where: {id}
    })

    if (!isEventExists) {
        throw new Error("Event not found");
    }

    await prisma.events.update({
        where: {id},
        data: {
            eventStatus: isAccepted ? EventStatus.APPROVED : EventStatus.REJECTED
        },
    });

}

const removeCompletedEvents = async (eventsId: string) => {
    const isEventExists = await prisma.events.findUnique({
        where: {id: eventsId}
    })

    if (!isEventExists) {
        throw new ApiError(httpStatus.NOT_FOUND, "Event not found");
    }

    if (isEventExists.eventStatus !== EventStatus.COMPLETED) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Event is not completed");
    }

    await prisma.events.delete({
        where: {id: eventsId}
    });

}

export const adminService = {
    getAllVendors,
    approveVendor,
    getEventDetails,
    approveEvents,
    removeCompletedEvents
}
