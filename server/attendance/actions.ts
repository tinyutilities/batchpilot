"use server";

import { prisma } from "@/server/db/prisma";
import { getCurrentTeacher } from "@/server/auth/get-current-teacher";
import { attendanceStatusToPrisma } from "@/server/attendance/mappers";
import { saveAttendanceSchema } from "@/server/attendance/validators";
import { getStudentsByBatch } from "@/server/batches/queries";
import { getAttendanceForBatchOnDate } from "@/server/attendance/queries";
import { parseDateKey } from "@/lib/utils";
import type { AttendanceEntryInput, AttendanceRecord, AttendanceStatus } from "@/types/attendance";
import type { Student } from "@/types/student";

export async function saveAttendanceForBatch(
  batchId: string,
  date: string,
  entries: AttendanceEntryInput[],
): Promise<AttendanceRecord[]> {
  const teacher = await getCurrentTeacher();
  if (!teacher) throw new Error("Not authenticated");

  const parsed = saveAttendanceSchema.parse({ batchId, date, entries });

  const batch = await prisma.batch.findFirst({
    where: { id: parsed.batchId, teacherId: teacher.id },
  });
  if (!batch) throw new Error("Batch not found");

  const dateValue = parseDateKey(parsed.date);
  const markedAt = new Date();

  await prisma.$transaction(
    parsed.entries.map((entry) =>
      prisma.attendance.upsert({
        where: {
          batchId_studentId_date: {
            batchId: parsed.batchId,
            studentId: entry.studentId,
            date: dateValue,
          },
        },
        create: {
          batchId: parsed.batchId,
          studentId: entry.studentId,
          teacherId: teacher.id,
          date: dateValue,
          status: attendanceStatusToPrisma(entry.status),
          markedAt,
        },
        update: {
          status: attendanceStatusToPrisma(entry.status),
          markedAt,
        },
      }),
    ),
  );

  return getAttendanceForBatchOnDate(teacher.id, parsed.batchId, parsed.date);
}

export async function deleteAttendanceRecord(id: string): Promise<boolean> {
  const teacher = await getCurrentTeacher();
  if (!teacher) throw new Error("Not authenticated");

  const existing = await prisma.attendance.findFirst({
    where: { id, teacherId: teacher.id },
  });
  if (!existing) return false;

  await prisma.attendance.delete({ where: { id } });
  return true;
}

// Client-callable combined fetch for the Mark Attendance page — the batch
// and date pickers change roster/statuses reactively without a page
// navigation, so this needs to be invocable directly from a client effect.
export async function getAttendanceMarkingData(
  batchId: string,
  date: string,
): Promise<{
  students: Student[];
  initialStatuses: Record<string, AttendanceStatus>;
}> {
  const teacher = await getCurrentTeacher();
  if (!teacher) throw new Error("Not authenticated");

  const [students, records] = await Promise.all([
    getStudentsByBatch(teacher.id, batchId),
    getAttendanceForBatchOnDate(teacher.id, batchId, date),
  ]);

  const initialStatuses: Record<string, AttendanceStatus> = {};
  records.forEach((record) => {
    initialStatuses[record.studentId] = record.status;
  });

  return { students, initialStatuses };
}
