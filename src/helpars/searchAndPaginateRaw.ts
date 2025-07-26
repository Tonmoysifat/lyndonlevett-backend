import {PrismaCollectionMap} from "../interfaces/prisma-collections";
import prisma from "../shared/prisma";
import {paginationHelpers} from "./paginationHelper";

interface GeoFilter {
    longitude: number;
    latitude: number;
    radiusInKm?: number;
}

type CollectionName = keyof PrismaCollectionMap;

// interface LookupConfig {
//     from: string;
//     localField: string;
//     foreignField: string;
//     as: string;
//     unwind?: boolean;
// }

interface SearchAndPaginateRawOptions<K extends CollectionName> {
    collection: K;
    page?: number;
    limit?: number;
    geoFilter?: GeoFilter;
    whereCondition?: Record<string, any>;
    selectFields?: (keyof PrismaCollectionMap[K] | string)[];
}

const searchAndPaginateRaw = async <K extends CollectionName>({
                                                                  collection,
                                                                  page = 1,
                                                                  limit = 10,
                                                                  geoFilter,
                                                                  whereCondition,
                                                                  selectFields = [],
                                                              }: SearchAndPaginateRawOptions<K>) => {


    const skip = (page - 1) * limit;


    const geoMatch = geoFilter
        ? {
            location: {
                $geoWithin: {
                    $centerSphere: [
                        [geoFilter.longitude, geoFilter.latitude],
                        (geoFilter.radiusInKm ?? 10) / 6378.1,
                    ],
                },
            },
        }
        : {};

    const matchStage = {
        $match: {
            ...geoMatch,
            ...whereCondition,
        },
    };

    const projectStage =
        selectFields.length > 0
            ? {
                $project: selectFields.reduce((acc, field) => {
                    acc[field as string] = 1;
                    return acc;
                }, {} as Record<string, 1>),
            }
            : null;

    const pipeline: any[] = [
        matchStage,
        // ...lookupStages,
        ...(projectStage ? [projectStage] : []),
        {$sort: {createdAt: -1}},
        {$skip: skip},
        {$limit: limit},
    ];

    // const countPipeline = [matchStage, ...lookupStages, { $count: "total" }];
    const countPipeline = [matchStage, {$count: "total"}];

    type ResultType = PrismaCollectionMap[K];

    const [dataResult, countResult] = await Promise.all([
        prisma.$runCommandRaw({
            aggregate: collection,
            pipeline,
            cursor: {},
        }),
        prisma.$runCommandRaw({
            aggregate: collection,
            pipeline: countPipeline,
            cursor: {},
        }),
    ]);

    const data =
        typeof dataResult === "object" &&
        dataResult !== null &&
        "cursor" in dataResult &&
        typeof (dataResult as any).cursor === "object" &&
        (dataResult as any).cursor !== null &&
        "firstBatch" in (dataResult as any).cursor
            ? ((dataResult as any).cursor.firstBatch as ResultType[])
            : [];

    const total =
        typeof countResult === "object" &&
        countResult !== null &&
        "cursor" in countResult &&
        typeof (countResult as any).cursor === "object" &&
        (countResult as any).cursor !== null &&
        "firstBatch" in (countResult as any).cursor &&
        Array.isArray((countResult as any).cursor.firstBatch) &&
        (countResult as any).cursor.firstBatch.length > 0 &&
        "total" in (countResult as any).cursor.firstBatch[0]
            ? (countResult as any).cursor.firstBatch[0].total
            : 0;

    return {
        data,
        meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
};

export default searchAndPaginateRaw;