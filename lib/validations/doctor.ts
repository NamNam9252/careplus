import { z } from "zod";

export const DoctorProfileSchema = z.object({
    doctorId: z.string().min(1, "Doctor ID is required"),
    experience: z.number().int().min(0, "Experience must be a positive integer").max(70, "Experience cannot exceed 70 years"),
    specializations: z.array(z.string().min(1, "Specialization cannot be empty")).min(1, "At least one specialization is required"),
    phone: z.string().regex(/^[0-9]{10}$/, "Phone number must be 10 digits").optional().or(z.literal("")),
    bio: z.string().max(500, "Bio cannot exceed 500 characters").optional(),
});

export type DoctorProfileInput = z.infer<typeof DoctorProfileSchema>;

