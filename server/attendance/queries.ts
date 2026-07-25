import { prisma } from "@/server/db/prisma";
import { mapAttendanceRecord } from "@/server/attendance/mappers";
import { mapBatch } from "@/server/batches/mappers";
import {
  calculateAttendancePercentage,
  getWeekDayForDateKey,
} from "@/lib/calculations/attendance";
import { batchMeetsOnDay } from "@/lib/calculations/batch";
import { parseDateKey, toDateKey, toMonthKey } from "@/lib/utils";
import type {
  AttendanceRecord,
  BatchAttendanceSession,
  MonthlyAttendanceSummary,
  StudentAttendanceSummary,
  TodayAttendanceSummary,
} from "@/types/attendance";
import type { Batch } from "@/types/batch";

export async function getAttendanceByStudent(
  teacherId: string,
  studentId: string,
): Promise<AttendanceRecord[]> {
  const rows = await prisma.attendance.findMany({
    where: { teacherId, studentId },
    orderBy: { date: "desc" },
  });
  return rows.map(mapAttendanceRecord);
}

export async function getAttendanceByBatch(
  teacherId: string,
  batchId: string,
): Promise<AttendanceRecord[]> {
  const rows = await prisma.attendance.findMany({ where: { teacherId, batchId } });
  return rows.map(mapAttendanceRecord);
}

export async function getAttendanceForBatchOnDate(
  teacherId: string,
  batchId: string,
  date: string,
): Promise<AttendanceRecord[]> {
  const rows = await prisma.attendance.findMany({
    where: { teacherId, batchId, date: parseDateKey(date) },
  });
  return rows.map(mapAttendanceRecord);
}

export async function isAttendanceMarkedForBatch(
  teacherId: string,
  batchId: string,
  date: string,
): Promise<boolean> {
  const count = await prisma.attendance.count({
    where: { teacherId, batchId, date: parseDateKey(date) },
  });
  return count > 0;
}

export async function getStudentAttendanceSummary(
  teacherId: string,
  studentId: string,
): Promise<StudentAttendanceSummary> {
  const records = await getAttendanceByStudent(teacherId, studentId);
  return {
    studentId,
    totalRecords: records.length,
    presentCount: records.filter((r) => r.status === "present").length,
    absentCount: records.filter((r) => r.status === "absent").length,
    lateCount: records.filter((r) => r.status === "late").length,
    excusedCount: records.filter((r) => r.status === "excused").length,
    attendancePercentage: calculateAttendancePercentage(records),
  };
}

export async function getAllAttendanceSessions(
  teacherId: string,
): Promise<BatchAttendanceSession[]> {
  const [records, batches] = await Promise.all([
    prisma.attendance.findMany({ where: { teacherId } }),
    prisma.batch.findMany({ where: { teacherId }, select: { id: true, name: true } }),
  ]);
  const batchNameById = new Map(batches.map((b) => [b.id, b.name]));

  const sessionMap = new Map<string, AttendanceRecord[]>();
  records.map(mapAttendanceRecord).forEach((record) => {
    const key = `${record.batchId}__${record.date}`;
    const list = sessionMap.get(key) ?? [];
    list.push(record);
    sessionMap.set(key, list);
  });

  return Array.from(sessionMap.entries())
    .map(([key, sessionRecords]) => {
      const [batchId, date] = key.split("__");
      return {
        batchId,
        batchName: batchNameById.get(batchId) ?? "Unknown Batch",
        date,
        records: sessionRecords,
        presentCount: sessionRecords.filter((r) => r.status === "present").length,
        absentCount: sessionRecords.filter((r) => r.status === "absent").length,
        lateCount: sessionRecords.filter((r) => r.status === "late").length,
        excusedCount: sessionRecords.filter((r) => r.status === "excused").length,
        totalStudents: sessionRecords.length,
      };
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export async function getAttendanceSessionsForBatch(
  teacherId: string,
  batchId: string,
): Promise<BatchAttendanceSession[]> {
  const sessions = await getAllAttendanceSessions(teacherId);
  return sessions.filter((session) => session.batchId === batchId);
}

export async function getScheduledBatchesForDate(
  teacherId: string,
  date: string,
): Promise<Batch[]> {
  const weekDay = getWeekDayForDateKey(date);
  const rows = await prisma.batch.findMany({
    where: { teacherId, status: "ACTIVE" },
    include: { schedule: true, teacher: { select: { fullName: true } } },
  });
  return rows.map(mapBatch).filter((batch) => batchMeetsOnDay(batch, weekDay));
}

export async function getTodayAttendanceSummary(
  teacherId: string,
): Promise<TodayAttendanceSummary> {
  const todayKeyValue = toDateKey(new Date());
  const [todaysRows, scheduledBatches] = await Promise.all([
    prisma.attendance.findMany({
      where: { teacherId, date: parseDateKey(todayKeyValue) },
    }),
    getScheduledBatchesForDate(teacherId, todayKeyValue),
  ]);

  const mapped = todaysRows.map(mapAttendanceRecord);
  const markedBatchIds = new Set(mapped.map((r) => r.batchId));

  return {
    date: todayKeyValue,
    totalBatchesScheduledToday: scheduledBatches.length,
    batchesMarkedToday: scheduledBatches.filter((batch) =>
      markedBatchIds.has(batch.id),
    ).length,
    totalStudentsMarked: mapped.length,
    presentCount: mapped.filter((r) => r.status === "present").length,
    absentCount: mapped.filter((r) => r.status === "absent").length,
    lateCount: mapped.filter((r) => r.status === "late").length,
    excusedCount: mapped.filter((r) => r.status === "excused").length,
  };
}

export async function getMonthlyAttendanceStats(
  teacherId: string,
  monthsBack = 6,
): Promise<MonthlyAttendanceSummary[]> {
  const today = new Date();
  const offsets = Array.from({ length: monthsBack }, (_, i) => monthsBack - 1 - i);

  return Promise.all(
    offsets.map(async (offset) => {
      const monthStart = new Date(today.getFullYear(), today.getMonth() - offset, 1);
      const monthEnd = new Date(
        today.getFullYear(),
        today.getMonth() - offset + 1,
        1,
      );
      const monthKey = toMonthKey(monthStart);

      const rows = await prisma.attendance.findMany({
        where: { teacherId, date: { gte: monthStart, lt: monthEnd } },
      });
      const mapped = rows.map(mapAttendanceRecord);

      return {
        month: monthKey,
        averagePercentage: calculateAttendancePercentage(mapped),
        totalRecords: mapped.length,
      };
    }),
  );
}
