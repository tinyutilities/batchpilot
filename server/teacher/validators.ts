import { z } from "zod";

export const teacherProfileSchema = z.object({
  fullName: z.string().max(200).optional(),
  email: z.string().max(200).optional(),
  phone: z.string().max(30).optional(),
  designation: z.string().max(200).optional(),
});

export const instituteProfileSchema = z.object({
  name: z.string().max(200).optional(),
  address: z.string().max(400).optional(),
  city: z.string().max(120).optional(),
  state: z.string().max(120).optional(),
  pincode: z.string().max(20).optional(),
  contactNumber: z.string().max(30).optional(),
  website: z.string().max(300).optional(),
});

export const teacherPreferencesSchema = z.object({
  emailNotifications: z.boolean().optional(),
  autoReports: z.boolean().optional(),
  teachesUnderInstitute: z.boolean().optional(),
});
