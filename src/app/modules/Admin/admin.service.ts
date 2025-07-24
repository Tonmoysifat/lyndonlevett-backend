import prisma from "../../../shared/prisma";
import {UserRole, UserStatus} from "@prisma/client";
import {paginationHelpers} from "../../../helpars/paginationHelper";
import {Request} from "express";

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

export const adminService = {
    getAllVendors,
    approveVendor
}
