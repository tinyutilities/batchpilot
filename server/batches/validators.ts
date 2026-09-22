import { z } from "zod";

export const scheduleEntrySchema = z.object({
  day: z.enum(["mon", "tue", "wed", "thu", "fri", "sat", "sun"]),
  startTime: z.string().min(1, "Start time is required."),
  endTime: z.string().min(1, "End time is required."),
});

export const batchFormSchema = z.object({
  name: z.string().min(1, "Batch name is required."),
  subject: z.string().max(200).optional().default(""),
  googleMeetLink: z.string().max(500).optional().default(""),
  schedule: z.array(scheduleEntrySchema),
  capacity: z.number().int().min(0).default(0),
  status: z.enum(["active", "inactive", "archived"]),
  monthlyFee: z.number().positive().optional(),
});
