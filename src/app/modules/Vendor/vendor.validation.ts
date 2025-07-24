import {z} from "zod";
import {EventCategory, EventStatus, EventType, Season, VenueType} from "@prisma/client";

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

    category: z.nativeEnum(EventCategory),
    type: z.nativeEnum(EventType),
    venueType: z.nativeEnum(VenueType),
    season: z.nativeEnum(Season),
    size: z.number(),
    price: z.number(),

    startAddress: z.string().optional(),
    endAddress: z.string().optional(),
    distance: z.string().optional(),
    ageLimit: z.string().optional(),

    frequentlyAskedQuestions: z.array(z.record(z.string(), z.string())).optional(),
    eventImages: z.array(z.string().url("Invalid image URL")).min(1, "At least one image is required"),
});

const updateEventSchema = EventSchema.partial()

export const eventValidation = {
    EventSchema,
    updateEventSchema
};

export type IEvent = z.infer<typeof EventSchema>;

