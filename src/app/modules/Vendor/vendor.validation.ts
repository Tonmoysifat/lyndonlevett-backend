import {z} from "zod";
import {EventCategory, EventStatus, EventType, Season, VenueType} from "@prisma/client";


export const locationSchema = z.object({
    type: z.literal("Point"),
    address: z.string().min(1, "Address is required"),
    coordinates: z
        .tuple([
            z.number().refine((val) => !isNaN(Number(val)), {
                message: "Longitude must be a number string",
            }),
            z.number().refine((val) => !isNaN(Number(val)), {
                message: "Latitude must be a number string",
            }),
        ])
        .refine(
            ([lng, lat]) => {
                // const lon = Number(lng);
                // const latitude = Number(lat);
                return lng >= -180 && lng <= 180 && lat >= -90 && lat <= 90;
            },
            {
                message: "Coordinates are out of range",
            }
        ),
});


const EventSchema = z.object({
    title: z.string().min(1, "Event title is required"),
    description: z.string().min(1, "Equipment description is required"), // Enum validation
    startDate: z
        .string()
        .refine((date) => !isNaN(Date.parse(date)), {
            message: "Start date of the events must be a valid ISO date string",
        }),

    endDate: z
        .string()
        .refine((date) => !isNaN(Date.parse(date)), {
            message: "End date of of the events must be a valid ISO date string",
        }),
    time: z.string(),
    continent: z.string(),
    country: z.string(),
    region: z.string(),
    address: z.string(),
    location: locationSchema,

    category: z.nativeEnum(EventCategory),
    type: z.nativeEnum(EventType),
    venueType: z.nativeEnum(VenueType),
    season: z.nativeEnum(Season),
    size: z.number(),
    price: z.number(),

    startAddress: z.string().optional(),
    endAddress: z.string().optional(),
    distance: z.number().optional(),
    ageLimit: z.string().optional(),

    frequentlyAskedQuestions: z.array(z.record(z.string(), z.string())).optional(),
    eventImages: z.array(z.string().url("Invalid image URL")).min(1, "At least one image is required"),
});

const updateEventSchema = EventSchema.partial()

const GearSchema = z.object({
    gearTitle: z.string().min(1, "Gear title is required"),
    categoryName: z.string().min(1, "Category name description is required"), // Enum validation
    price: z.number(),
    sizes: z.array(z.string()).min(1, "At least one size is required"),
    colors: z.array(z.string()).min(1, "At least one color is required"),
    gearImagesAndColor: z.array(z.string().url("Invalid image URL")).min(1, "At least one image is required"),
});

const updateGearSchema = GearSchema.partial()

export const eventValidation = {
    EventSchema,
    updateEventSchema,
    GearSchema,
    updateGearSchema
};

export type IEvent = z.infer<typeof EventSchema>;
export type IGear = z.infer<typeof GearSchema>;

