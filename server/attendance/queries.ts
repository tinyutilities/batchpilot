import { cache } from "react";
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

// Cached per request — dashboard's stats/schedule/activity all pull every
// attendance session in the same render, and this dedupes those into one
// pair of queries instead of three.
export const getAllAttendanceSessions = cache(async (
  teacherId: string,
): Promise<BatchAttendanceSession[]> => {
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
});

export async function getAttendanceSessionsForBatch(
  teacherId: string,
  batchId: string,
): Promise<BatchAttendanceSession[]> {
  const sessions = await getAllAttendanceSessions(teacherId);
  return sessions.filter((session) => session.batchId === batchId);
}

// Cached per request — dashboard's stats/schedule and the attendance page
// both ask "what's scheduled today", and this dedupes those into one query.
export const getScheduledBatchesForDate = cache(async (
  teacherId: string,
  date: string,
): Promise<Batch[]> => {
  const weekDay = getWeekDayForDateKey(date);
  const rows = await prisma.batch.findMany({
    where: { teacherId, status: "ACTIVE" },
    include: { schedule: true, teacher: { select: { fullName: true } } },
  });
  return rows.map(mapBatch).filter((batch) => batchMeetsOnDay(batch, weekDay));
});

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
  // Same boundary construction as the old per-month query (local-timezone
  // `new Date(year, month, 1)`), just spanning the whole window in one go:
  // [start of the oldest month, start of the month after the current one).
  const rangeStart = new Date(today.getFullYear(), today.getMonth() - (monthsBack - 1), 1);
  const rangeEnd = new Date(today.getFullYear(), today.getMonth() + 1, 1);

  const rows = await prisma.attendance.findMany({
    where: { teacherId, date: { gte: rangeStart, lt: rangeEnd } },
  });

  // Bucket by month using the same local-timezone getters `new Date(y, m, 1)`
  // boundaries imply, so a row lands in the same month it would have matched
  // under the old per-month `gte`/`lt` query.
  const recordsByMonth = new Map<string, AttendanceRecord[]>();
  rows.forEach((row) => {
    const monthKey = toMonthKey(row.date);
    const list = recordsByMonth.get(monthKey) ?? [];
    list.push(mapAttendanceRecord(row));
    recordsByMonth.set(monthKey, list);
  });

  const results: MonthlyAttendanceSummary[] = [];
  for (let offset = monthsBack - 1; offset >= 0; offset--) {
    const monthDate = new Date(today.getFullYear(), today.getMonth() - offset, 1);
    const monthKey = toMonthKey(monthDate);
    const monthRecords = recordsByMonth.get(monthKey) ?? [];

    results.push({
      month: monthKey,
      averagePercentage: calculateAttendancePercentage(monthRecords),
      totalRecords: monthRecords.length,
    });
  }

  return results;
}
