import { cache } from "react";
import { prisma } from "@/server/db/prisma";
import { mapBatch } from "@/server/batches/mappers";
import { mapStudent } from "@/server/students/mappers";
import {
  getAttendancePercentagesByStudentIds,
  getPendingFeesByStudentIds,
} from "@/server/students/queries";
import type { Batch, BatchStatsData, BatchWithRoster } from "@/types/batch";
import type { Student } from "@/types/student";

const batchInclude = {
  schedule: true,
  teacher: { select: { fullName: true } },
} as const;

// Cached per request — dashboard/batches/attendance/fees/marks pages all
// pull the full batch list in the same render, and this dedupes those into
// one query.
export const getAllBatches = cache(async (teacherId: string): Promise<Batch[]> => {
  const rows = await prisma.batch.findMany({
    where: { teacherId },
    include: batchInclude,
    orderBy: { createdAt: "desc" },
  });
  return rows.map(mapBatch);
});

export async function getBatchById(
  teacherId: string,
  id: string,
): Promise<Batch | null> {
  const row = await prisma.batch.findFirst({
    where: { id, teacherId },
    include: batchInclude,
  });
  return row ? mapBatch(row) : null;
}

export async function getStudentsByBatch(
  teacherId: string,
  batchId: string,
): Promise<Student[]> {
  const students = await prisma.student.findMany({
    where: { teacherId, batchId },
  });
  const studentIds = students.map((s) => s.id);

  const [batch, attendanceByStudent, pendingFeesByStudent] = await Promise.all([
    prisma.batch.findUnique({ where: { id: batchId }, select: { name: true } }),
    getAttendancePercentagesByStudentIds(teacherId, studentIds),
    getPendingFeesByStudentIds(teacherId, studentIds),
  ]);

  return students.map((student) =>
    mapStudent(student, {
      batchName: batch?.name ?? "",
      attendancePercentage: attendanceByStudent.get(student.id) ?? 0,
      pendingFees: pendingFeesByStudent.get(student.id) ?? 0,
    }),
  );
}

export async function getBatchWithRoster(
  teacherId: string,
  id: string,
): Promise<BatchWithRoster | null> {
  const batch = await getBatchById(teacherId, id);
  if (!batch) return null;

  const students = await getStudentsByBatch(teacherId, id);

  return {
    ...batch,
    students,
    enrolledCount: students.length,
    capacityPercentage:
      batch.capacity > 0 ? Math.round((students.length / batch.capacity) * 100) : 0,
  };
}

export async function getBatchStats(teacherId: string): Promise<BatchStatsData> {
  const [totalBatches, activeBatches, totalEnrolled, capacityRows] = await Promise.all([
    prisma.batch.count({ where: { teacherId } }),
    prisma.batch.count({ where: { teacherId, status: "ACTIVE" } }),
    prisma.student.count({ where: { teacherId, batchId: { not: null } } }),
    prisma.batch.findMany({
      where: { teacherId, status: "ACTIVE", capacity: { gt: 0 } },
      select: { capacity: true, _count: { select: { students: true } } },
    }),
  ]);

  const capacityUsages = capacityRows.map(
    (batch) => (batch._count.students / batch.capacity) * 100,
  );

  return {
    totalBatches,
    activeBatches,
    totalEnrolled,
    averageCapacityUsage:
      capacityUsages.length === 0
        ? 0
        : Math.round(
            capacityUsages.reduce((sum, value) => sum + value, 0) /
              capacityUsages.length,
          ),
  };
}
