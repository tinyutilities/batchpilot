import { z } from "zod";

export const testFormSchema = z.object({
  name: z.string().min(1, "Test name is required."),
  subject: z.string().min(1, "Subject is required."),
  batchId: z.string().min(1, "Batch is required."),
  maxMarks: z.number().int().positive(),
  testDate: z.string().min(1),
  remarks: z.string().max(1000).optional().default(""),
});

export const markEntrySchema = z.object({
  studentId: z.string().min(1),
  marksObtained: z.number().nonnegative(),
  status: z.enum(["present", "absent"]),
});
