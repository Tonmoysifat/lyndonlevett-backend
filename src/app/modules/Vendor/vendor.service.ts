import {IEvent, IGear} from "./vendor.validation";
import prisma from "../../../shared/prisma";
import {Request} from "express";
import {paginationHelpers} from "../../../helpars/paginationHelper";
import {EventStatus} from "@prisma/client";
import ApiErrors from "../../../errors/ApiErrors";
import httpStatus from "http-status";

const createEvents = async (userId: string, eventData: IEvent) => {

    const isUserExists = await prisma.user.findUnique({
        where: {id: userId},
    })

    if (!isUserExists) {
        throw new Error("User not found");
    }

    const event = await prisma.events.create({
        data: {
            ...eventData,
            userId,
        },
    });


    return event;
}

const getAllEventsForVendor = async (userId: string, req: Request) => {
    const filters = {
        page: Number(req.query.page) || 1,
        limit: Number(req.query.limit),
        eventStatus: req.query.eventStatus as EventStatus,
        searchField: req.query.searchField as string | undefined,
        dateRange: req.query.dateRange as string | undefined,
    };

    const {page, limit, skip} = paginationHelpers.calculatePagination(filters);

    const whereCondition: any = {
        userId,
        eventStatus: filters.eventStatus
    };

    if (filters.eventStatus) {
        whereCondition.eventStatus = filters.eventStatus;
    }

    if (filters.searchField) {
        whereCondition.OR = [
            {
                title: {
                    contains: filters.searchField,
                    mode: "insensitive",
                },
            },
        ];
    }

    if (filters.dateRange) {
        const [month, year] = filters.dateRange.split("/").map(val => parseInt(val, 10));

        const startDate = new Date(year, month - 1, 1, 0, 0, 0); // Start of the month
        const endDate = new Date(year, month, 0, 23, 59, 59);   // End of the month

        whereCondition.AND = [
            {
                startDate: {
                    lte: endDate, // Event can start before or during the month
                },
            },
            {
                endDate: {
                    gte: startDate, // Event can end after or during the month
                },
            },
        ];
    }

    const total = await prisma.events.count({where: whereCondition});

    const events = await prisma.events.findMany({
        where: whereCondition,
        orderBy: {createdAt: "desc"},
        select: {
            id: true,
            title: true,
            eventImages: true,
            address: true,
            startDate: true,
            endDate: true,
            category: true,
            distance: true,
            price: true,
            description: true,
            eventStatus: true,
            createdAt: true,
        },
        skip,
        take: limit,
    });

    return {
        meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
        data: events,
    };
}

const createGear = async (userId: string, eventId: string, payload: IGear) => {

    const isEventExits = await prisma.events.findUnique({
        where: {
            id: eventId
        }
    })

    if (!isEventExits) {
        throw new ApiErrors(httpStatus.NOT_FOUND, "Event not found")
    }

    const newGear = await prisma.gear.create({
        data: {
            userId,
            eventId,
            ...payload
        }
    })

    return newGear
}

export const vendorService = {
    createEvents,
    getAllEventsForVendor,
    createGear
}