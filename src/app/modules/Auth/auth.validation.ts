import {z} from "zod";
import {Gender, UserRole} from "@prisma/client";


const userValidationSchema = z.object({
    fullName: z.string().min(2, "Full name is required"),
    dateOfBirth: z
        .string()
        .refine((date) => !isNaN(Date.parse(date)), {
            message: "Date of birth must be a valid ISO date string",
        }).optional(),
    gender: z.nativeEnum(Gender).optional(),
    email: z.string().email(),
    password: z.string().min(8, "Password must be at least 8 characters"),
    role: z.nativeEnum(UserRole),
    continent: z.string().optional(),
    country: z.string().optional(),
    region: z.string().optional(),
    zipCode: z.string().optional(),

    profileImage: z.string().url().optional(),
    oldPassword: z.string().optional(),
    newPassword: z.string().optional(),
});

const updateProfileSchema = userValidationSchema.partial()

const changePasswordValidationSchema = z.object({
    oldPassword: z.string().min(8),
    newPassword: z.string().min(8),
});

export const authValidation = {
    changePasswordValidationSchema,
    userValidationSchema,
    updateProfileSchema
}

export type IUser = z.infer<typeof userValidationSchema>;