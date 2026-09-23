import { cache } from "react";
import { prisma } from "@/server/db/prisma";
import { mapStudent } from "@/server/students/mappers";
import type { Student } from "@/types/student";

// Present + late count as attended; excused is excluded entirely from the
// denominator — mirrors lib/mock/attendance.ts's calculateAttendancePercentage.
function percentageFromCounts(counts: Record<string, number>): number {
  const present = counts.PRESENT ?? 0;
  const late = counts.LATE ?? 0;
  const absent = counts.ABSENT ?? 0;
  const countable = present + late + absent;
  if (countable === 0) return 0;
  return Math.round(((present + late) / countable) * 100);
}

export async function getAttendancePercentagesByStudentIds(
  teacherId: string,
  studentIds: string[],
): Promise<Map<string, number>> {
  if (studentIds.length === 0) return new Map();

  const groups = await prisma.attendance.groupBy({
    by: ["studentId", "status"],
    where: { teacherId, studentId: { in: studentIds } },
    _count: { _all: true },
  });

  const countsByStudent = new Map<string, Record<string, number>>();
  for (const group of groups) {
    const counts = countsByStudent.get(group.studentId) ?? {};
    counts[group.status] = group._count._all;
    countsByStudent.set(group.studentId, counts);
  }

  const result = new Map<string, number>();
  for (const id of studentIds) {
    result.set(id, percentageFromCounts(countsByStudent.get(id) ?? {}));
  }
  return result;
}

export async function getPendingFeesByStudentIds(
  teacherId: string,
  studentIds: string[],
): Promise<Map<string, number>> {
  if (studentIds.length === 0) return new Map();

  const groups = await prisma.fee.groupBy({
    by: ["studentId"],
    where: { teacherId, studentId: { in: studentIds } },
    _sum: { amount: true, amountPaid: true },
  });

  const result = new Map<string, number>();
  for (const group of groups) {
    const amount = Number(group._sum.amount ?? 0);
    const paid = Number(group._sum.amountPaid ?? 0);
    result.set(group.studentId, amount - paid);
  }
  return result;
}

// Lightweight fetch for pages that only need to count enrollment per batch
// (e.g. the Batches list) without pulling every student field.
export async function getStudentBatchAssignments(
  teacherId: string,
): Promise<{ batchId: string | null }[]> {
  return prisma.student.findMany({
    where: { teacherId },
    select: { batchId: true },
  });
}

// Cached per request — dashboard, students and marks pages all pull the
// full roster in the same render, and this dedupes those into one query.
export const getAllStudents = cache(async (teacherId: string): Promise<Student[]> => {
  const students = await prisma.student.findMany({
    where: { teacherId },
    orderBy: { createdAt: "desc" },
  });

  const studentIds = students.map((s) => s.id);
  const batchIds = [
    ...new Set(students.map((s) => s.batchId).filter((id): id is string => Boolean(id))),
  ];

  const [batches, attendanceByStudent, pendingFeesByStudent] = await Promise.all([
    batchIds.length > 0
      ? prisma.batch.findMany({ where: { id: { in: batchIds } }, select: { id: true, name: true } })
      : Promise.resolve([]),
    getAttendancePercentagesByStudentIds(teacherId, studentIds),
    getPendingFeesByStudentIds(teacherId, studentIds),
  ]);

  const batchNameById = new Map(batches.map((b) => [b.id, b.name]));

  return students.map((student) =>
    mapStudent(student, {
      batchName: student.batchId ? (batchNameById.get(student.batchId) ?? "") : "",
      attendancePercentage: attendanceByStudent.get(student.id) ?? 0,
      pendingFees: pendingFeesByStudent.get(student.id) ?? 0,
    }),
  );
});

export async function getStudentById(
  teacherId: string,
  id: string,
): Promise<Student | null> {
  const student = await prisma.student.findFirst({ where: { id, teacherId } });
  if (!student) return null;

  const [batch, attendanceByStudent, pendingFeesByStudent] = await Promise.all([
    student.batchId
      ? prisma.batch.findUnique({ where: { id: student.batchId }, select: { name: true } })
      : Promise.resolve(null),
    getAttendancePercentagesByStudentIds(teacherId, [id]),
    getPendingFeesByStudentIds(teacherId, [id]),
  ]);

  return mapStudent(student, {
    batchName: batch?.name ?? "",
    attendancePercentage: attendanceByStudent.get(id) ?? 0,
    pendingFees: pendingFeesByStudent.get(id) ?? 0,
  });
}
