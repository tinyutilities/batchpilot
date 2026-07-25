import { z } from "zod";

export const studentFormSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().max(200).optional().default(""),
  phone: z.string().max(30).optional().default(""),
  gender: z.enum(["male", "female", "other"]),
  dateOfBirth: z.string().max(30).optional().default(""),
  guardianName: z.string().max(200).optional().default(""),
  guardianPhone: z.string().max(30).optional().default(""),
  address: z.string().max(400).optional().default(""),
  batchId: z.string().min(1, "Batch is required."),
  school: z.string().max(200).optional().default(""),
  status: z.enum(["active", "inactive"]),
});
