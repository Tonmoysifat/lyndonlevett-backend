import {Request} from "express";
import {paginationHelpers} from "../../../helpars/paginationHelper";
import {EventCategory, EventStatus, EventType} from "@prisma/client";
import searchAndPaginateRaw from "../../../helpars/searchAndPaginateRaw";

const getAllActiveEvents = async (req: Request) => {
    const filters = {
        page: Number(req.query.page) || 1,
        limit: Number(req.query.limit) || 10,
        searchField: req.query.searchField as string | undefined,
        raceType: req.query.raceType as EventType | undefined,
        date: req.query.date as string | undefined,
        distanceMinOrMax: req.query.distanceMinOrMax as string | undefined,
        distance: req.query.distance as string | undefined,
        continent: req.query.continent as string | undefined,
        country: req.query.country as string | undefined,
        region: req.query.region as string | undefined,
        category: req.query.category as EventCategory | undefined,
        longitude: req.query.longitude as string | undefined,
        latitude: req.query.latitude as string | undefined,
    };

    // const {page, limit, skip} = paginationHelpers.calculatePagination(filters);


    const safeLimit = Math.min(Number(filters.limit), 50);

    const geoFilter =
        filters.longitude && filters.latitude
            ? {
                longitude: Number(filters.longitude),
                latitude: Number(filters.latitude),
                radiusInKm: Number(filters.distance),
            }
            : undefined;

    const whereCondition: any = {
        eventStatus: EventStatus.APPROVED,
    };

    if (filters.distanceMinOrMax && filters.distance) {
        const distanceValue = Number(filters.distance);
        if (filters.distanceMinOrMax === "min") {
            whereCondition.distance = {
                $gte: distanceValue,
            };
        } else if (filters.distanceMinOrMax === "max") {
            whereCondition.distance = {
                $lte: distanceValue,
            };
        }
    }

    if (filters.category) {
        whereCondition.category = filters.category;
    }

    if (filters.raceType) {
        whereCondition.type = filters.raceType;
    }

    // if (filters.continent) {
    //     whereCondition.continent = filters.continent;
    // }

    if (filters.continent) {
        whereCondition.continent = {
            $regex: filters.continent,
            $options: "i", // 'i' = case-insensitive
        };
    }

    if (filters.country) {
        whereCondition.country = {
            $regex: filters.country,
            $options: "i", // 'i' = case-insensitive
        };
    }

    if (filters.region) {
        whereCondition.region = {
            $regex: filters.region,
            $options: "i", // 'i' = case-insensitive
        };
    }

    // date will be in this dd-mm-yyyy format only and it will compare only with the startDate.
    if (filters.date) {
        const [day, month, year] = filters.date.split("-").map(val => parseInt(val, 10));
        const startDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
        const endDate = new Date(Date.UTC(year, month - 1, day, 23, 59, 59));

        // whereCondition.startDate = {
        //     $gte: startDate,
        //     $lte: endDate,
        // };

        whereCondition.date = {
            $gte: { $date: startDate.toISOString()},
            $lte: { $date: endDate.toISOString()},
        };

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

    // console.log(whereCondition)

    const result = await searchAndPaginateRaw<"events">({
        collection: "events",
        page: Number(filters.page),
        limit: safeLimit,
        geoFilter,
        whereCondition,
        selectFields: [
            "title",
            "eventImages",
            "address",
            "startDate",
            "endDate",
            "category",
            "distance",
            "price",
            "description",
            "eventStatus",
            "createdAt",
        ],
    });

    return result
}

export const userService = {
    getAllActiveEvents,
}