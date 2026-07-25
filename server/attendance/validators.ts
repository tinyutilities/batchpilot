import { z } from "zod";

export const attendanceEntrySchema = z.object({
  studentId: z.string().min(1),
  status: z.enum(["present", "absent", "late", "excused"]),
});

export const saveAttendanceSchema = z.object({
  batchId: z.string().min(1),
  date: z.string().min(1),
  entries: z.array(attendanceEntrySchema),
});
