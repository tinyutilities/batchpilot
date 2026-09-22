"use server";

import { prisma } from "@/server/db/prisma";
import { getCurrentTeacher } from "@/server/auth/get-current-teacher";
import { getAllBatches } from "@/server/batches/queries";
import { batchFormSchema } from "@/server/batches/validators";
import { batchStatusToPrisma, weekDayToPrisma } from "@/server/batches/mappers";
import { mapStudent } from "@/server/students/mappers";
import {
  getAttendancePercentagesByStudentIds,
  getPendingFeesByStudentIds,
  getStudentBatchAssignments,
} from "@/server/students/queries";
import type { Batch, BatchFormData } from "@/types/batch";
import type { Student } from "@/types/student";

// Client-callable wrappers for the SWR cache layer.
export async function fetchBatches(): Promise<Batch[]> {
  const teacher = await getCurrentTeacher();
  if (!teacher) throw new Error("Not authenticated");
  return getAllBatches(teacher.id);
}

export async function fetchBatchEnrollmentCounts(): Promise<Record<string, number>> {
  const teacher = await getCurrentTeacher();
  if (!teacher) throw new Error("Not authenticated");

  const assignments = await getStudentBatchAssignments(teacher.id);
  const counts: Record<string, number> = {};
  for (const { batchId } of assignments) {
    if (!batchId) continue;
    counts[batchId] = (counts[batchId] ?? 0) + 1;
  }
  return counts;
}

export async function createBatch(data: BatchFormData): Promise<string> {
  const teacher = await getCurrentTeacher();
  if (!teacher) throw new Error("Not authenticated");

  const parsed = batchFormSchema.parse(data);

  const batch = await prisma.batch.create({
    data: {
      name: parsed.name,
      subject: parsed.subject || "",
      googleMeetLink: parsed.googleMeetLink || null,
      capacity: parsed.capacity,
      status: batchStatusToPrisma(parsed.status),
      monthlyFee: parsed.monthlyFee ?? null,
      teacherId: teacher.id,
      schedule: {
        create: parsed.schedule.map((entry) => ({
          day: weekDayToPrisma(entry.day),
          startTime: entry.startTime,
          endTime: entry.endTime,
        })),
      },
    },
  });

  return batch.id;
}

export async function updateBatch(
  id: string,
  data: BatchFormData,
): Promise<string | null> {
  const teacher = await getCurrentTeacher();
  if (!teacher) throw new Error("Not authenticated");

  const existing = await prisma.batch.findFirst({
    where: { id, teacherId: teacher.id },
  });
  if (!existing) return null;

  const parsed = batchFormSchema.parse(data);

  await prisma.$transaction([
    prisma.batchScheduleEntry.deleteMany({ where: { batchId: id } }),
    prisma.batch.update({
      where: { id },
      data: {
        name: parsed.name,
        subject: parsed.subject || "",
        googleMeetLink: parsed.googleMeetLink || null,
        capacity: parsed.capacity,
        status: batchStatusToPrisma(parsed.status),
        monthlyFee: parsed.monthlyFee ?? null,
        schedule: {
          create: parsed.schedule.map((entry) => ({
            day: weekDayToPrisma(entry.day),
            startTime: entry.startTime,
            endTime: entry.endTime,
          })),
        },
      },
    }),
  ]);

  return id;
}

// Archiving hides a batch from the active roster/schedule while keeping
// every student, attendance, fee and marks record intact — unlike delete,
// which is blocked entirely once a batch has students (see canDeleteBatch).
// A teacher archives a batch when the course is over, rather than deleting
// history they'll want to look back on.
export async function archiveBatch(id: string): Promise<boolean> {
  const teacher = await getCurrentTeacher();
  if (!teacher) throw new Error("Not authenticated");

  const existing = await prisma.batch.findFirst({
    where: { id, teacherId: teacher.id },
  });
  if (!existing) return false;

  await prisma.batch.update({
    where: { id },
    data: { status: "ARCHIVED" },
  });
  return true;
}

export async function unarchiveBatch(id: string): Promise<boolean> {
  const teacher = await getCurrentTeacher();
  if (!teacher) throw new Error("Not authenticated");

  const existing = await prisma.batch.findFirst({
    where: { id, teacherId: teacher.id },
  });
  if (!existing) return false;

  await prisma.batch.update({
    where: { id },
    data: { status: "ACTIVE" },
  });
  return true;
}

export async function canDeleteBatch(
  teacherId: string,
  id: string,
): Promise<boolean> {
  const count = await prisma.student.count({ where: { teacherId, batchId: id } });
  return count === 0;
}

export async function deleteBatch(id: string): Promise<boolean> {
  const teacher = await getCurrentTeacher();
  if (!teacher) throw new Error("Not authenticated");

  const existing = await prisma.batch.findFirst({
    where: { id, teacherId: teacher.id },
  });
  if (!existing) return false;

  if (!(await canDeleteBatch(teacher.id, id))) return false;

  await prisma.batch.delete({ where: { id } });
  return true;
}

export async function assignStudentToBatch(
  studentId: string,
  batchId: string,
): Promise<Student | null> {
  const teacher = await getCurrentTeacher();
  if (!teacher) throw new Error("Not authenticated");

  const [batch, student] = await Promise.all([
    prisma.batch.findFirst({ where: { id: batchId, teacherId: teacher.id } }),
    prisma.student.findFirst({ where: { id: studentId, teacherId: teacher.id } }),
  ]);
  if (!batch || !student) return null;

  const updated = await prisma.student.update({
    where: { id: studentId },
    data: { batchId },
  });

  const [attendanceByStudent, pendingFeesByStudent] = await Promise.all([
    getAttendancePercentagesByStudentIds(teacher.id, [studentId]),
    getPendingFeesByStudentIds(teacher.id, [studentId]),
  ]);

  return mapStudent(updated, {
    batchName: batch.name,
    attendancePercentage: attendanceByStudent.get(studentId) ?? 0,
    pendingFees: pendingFeesByStudent.get(studentId) ?? 0,
  });
}

export async function removeStudentFromBatch(
  studentId: string,
): Promise<Student | null> {
  const teacher = await getCurrentTeacher();
  if (!teacher) throw new Error("Not authenticated");

  const existing = await prisma.student.findFirst({
    where: { id: studentId, teacherId: teacher.id },
  });
  if (!existing) return null;

  const updated = await prisma.student.update({
    where: { id: studentId },
    data: { batchId: null },
  });

  const [attendanceByStudent, pendingFeesByStudent] = await Promise.all([
    getAttendancePercentagesByStudentIds(teacher.id, [studentId]),
    getPendingFeesByStudentIds(teacher.id, [studentId]),
  ]);

  return mapStudent(updated, {
    batchName: "Unassigned",
    attendancePercentage: attendanceByStudent.get(studentId) ?? 0,
    pendingFees: pendingFeesByStudent.get(studentId) ?? 0,
  });
}
