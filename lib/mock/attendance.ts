// lib/mock/attendance.ts

import type {
  AttendanceEntryInput,
  AttendanceRecord,
  AttendanceStatsData,
  AttendanceStatus,
  BatchAttendanceSession,
  MonthlyAttendanceSummary,
  StudentAttendanceSummary,
  TodayAttendanceSummary,
} from "@/types/attendance";
import type { WeekDay } from "@/types/batch";
import { batchMeetsOnDay, getBatchById, mockBatches } from "@/lib/mock/batch";
import { mockStudents } from "@/lib/mock/student";
import { seededRandom, toDateKey, toMonthKey } from "@/lib/utils";
import { USE_DEMO_DATA } from "@/lib/config";

export { toDateKey };

const WEEKDAY_BY_INDEX: WeekDay[] = [
  "sun",
  "mon",
  "tue",
  "wed",
  "thu",
  "fri",
  "sat",
];

export function getWeekDay(date: Date): WeekDay {
  return WEEKDAY_BY_INDEX[date.getDay()];
}

function makeRecordId(studentId: string, batchId: string, date: string) {
  return `att-${batchId}-${studentId}-${date}`;
}

const ATTENDANCE_HISTORY_DAYS = 28;

function generateSeedAttendance(): AttendanceRecord[] {
  const records: AttendanceRecord[] = [];
  const today = new Date();

  mockStudents.forEach((student, studentIndex) => {
    const batch = getBatchById(student.batchId);
    if (!batch) return;

    const baselineRate = student.attendancePercentage / 100;

    for (let offset = 1; offset <= ATTENDANCE_HISTORY_DAYS; offset++) {
      const date = new Date(today);
      date.setDate(date.getDate() - offset);
      if (!batchMeetsOnDay(batch, getWeekDay(date))) continue;

      const roll = seededRandom(studentIndex * 1000 + offset);

      let status: AttendanceStatus;
      if (roll < baselineRate * 0.9) {
        status = "present";
      } else if (roll < baselineRate * 0.9 + 0.05) {
        status = "late";
      } else if (roll < baselineRate * 0.9 + 0.08) {
        status = "excused";
      } else {
        status = "absent";
      }

      const dateKey = toDateKey(date);
      records.push({
        id: makeRecordId(student.id, batch.id, dateKey),
        studentId: student.id,
        batchId: batch.id,
        date: dateKey,
        status,
        markedAt: date.toISOString(),
      });
    }
  });

  return records;
}

// A first-time user hasn't marked any attendance yet — only seed demo data
// when the feature flag is on (see lib/config.ts). This also cascades
// naturally: generateSeedAttendance() derives everything from mockStudents,
// so it would already produce [] once that repository is empty.
export const mockAttendanceRecords: AttendanceRecord[] = USE_DEMO_DATA
  ? generateSeedAttendance()
  : [];

export function getAttendanceById(id: string): AttendanceRecord | undefined {
  return mockAttendanceRecords.find((record) => record.id === id);
}

export function getAttendanceByStudent(studentId: string): AttendanceRecord[] {
  return mockAttendanceRecords
    .filter((record) => record.studentId === studentId)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getAttendanceByBatch(batchId: string): AttendanceRecord[] {
  return mockAttendanceRecords.filter((record) => record.batchId === batchId);
}

export function getAttendanceForBatchOnDate(
  batchId: string,
  date: string
): AttendanceRecord[] {
  return mockAttendanceRecords.filter(
    (record) => record.batchId === batchId && record.date === date
  );
}

export function isAttendanceMarkedForBatch(
  batchId: string,
  date: string
): boolean {
  return getAttendanceForBatchOnDate(batchId, date).length > 0;
}

// Excused days don't count against a student; late still counts as attended.
export function calculateAttendancePercentage(
  records: AttendanceRecord[]
): number {
  const countable = records.filter((record) => record.status !== "excused");
  if (countable.length === 0) return 0;

  const attended = countable.filter(
    (record) => record.status === "present" || record.status === "late"
  ).length;
  return Math.round((attended / countable.length) * 100);
}

export function getStudentAttendanceSummary(
  studentId: string
): StudentAttendanceSummary {
  const records = getAttendanceByStudent(studentId);

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

function syncStudentAttendancePercentage(studentId: string): void {
  const index = mockStudents.findIndex((student) => student.id === studentId);
  if (index === -1) return;

  const percentage = calculateAttendancePercentage(
    getAttendanceByStudent(studentId)
  );
  mockStudents[index] = {
    ...mockStudents[index],
    attendancePercentage: percentage,
  };
}

export function saveAttendanceForBatch(
  batchId: string,
  date: string,
  entries: AttendanceEntryInput[]
): AttendanceRecord[] {
  const markedAt = new Date().toISOString();
  const saved: AttendanceRecord[] = [];

  entries.forEach((entry) => {
    const id = makeRecordId(entry.studentId, batchId, date);
    const index = mockAttendanceRecords.findIndex((record) => record.id === id);
    const record: AttendanceRecord = {
      id,
      studentId: entry.studentId,
      batchId,
      date,
      status: entry.status,
      markedAt,
    };

    if (index === -1) {
      mockAttendanceRecords.push(record);
    } else {
      mockAttendanceRecords[index] = record;
    }

    saved.push(record);
    syncStudentAttendancePercentage(entry.studentId);
  });

  return saved;
}

export function deleteAttendanceRecord(id: string): boolean {
  const index = mockAttendanceRecords.findIndex((record) => record.id === id);
  if (index === -1) return false;

  const { studentId } = mockAttendanceRecords[index];
  mockAttendanceRecords.splice(index, 1);
  syncStudentAttendancePercentage(studentId);
  return true;
}

export function computeAttendanceStats(
  records: AttendanceRecord[]
): AttendanceStatsData {
  return {
    totalRecords: records.length,
    presentCount: records.filter((r) => r.status === "present").length,
    absentCount: records.filter((r) => r.status === "absent").length,
    lateCount: records.filter((r) => r.status === "late").length,
    excusedCount: records.filter((r) => r.status === "excused").length,
    averageAttendancePercentage: calculateAttendancePercentage(records),
  };
}

export function getTodayAttendanceSummary(): TodayAttendanceSummary {
  const today = new Date();
  const todayKey = toDateKey(today);
  const todaysRecords = mockAttendanceRecords.filter(
    (record) => record.date === todayKey
  );
  const scheduledBatches = mockBatches.filter(
    (batch) => batch.status === "active" && batchMeetsOnDay(batch, getWeekDay(today))
  );
  const markedBatchIds = new Set(todaysRecords.map((record) => record.batchId));

  return {
    date: todayKey,
    totalBatchesScheduledToday: scheduledBatches.length,
    batchesMarkedToday: scheduledBatches.filter((batch) =>
      markedBatchIds.has(batch.id)
    ).length,
    totalStudentsMarked: todaysRecords.length,
    presentCount: todaysRecords.filter((r) => r.status === "present").length,
    absentCount: todaysRecords.filter((r) => r.status === "absent").length,
    lateCount: todaysRecords.filter((r) => r.status === "late").length,
    excusedCount: todaysRecords.filter((r) => r.status === "excused").length,
  };
}

export function getWeekDayForDateKey(date: string): WeekDay {
  const [year, month, day] = date.split("-").map(Number);
  return getWeekDay(new Date(year, month - 1, day));
}

export function getScheduledBatchesForDate(date: string) {
  const weekDay = getWeekDayForDateKey(date);
  return mockBatches.filter(
    (batch) => batch.status === "active" && batchMeetsOnDay(batch, weekDay)
  );
}

export function getAllAttendanceSessions(): BatchAttendanceSession[] {
  const sessionMap = new Map<string, AttendanceRecord[]>();

  mockAttendanceRecords.forEach((record) => {
    const key = `${record.batchId}__${record.date}`;
    const list = sessionMap.get(key) ?? [];
    list.push(record);
    sessionMap.set(key, list);
  });

  return Array.from(sessionMap.entries())
    .map(([key, records]) => {
      const [batchId, date] = key.split("__");
      const batch = getBatchById(batchId);
      return {
        batchId,
        batchName: batch?.name ?? "Unknown Batch",
        date,
        records,
        presentCount: records.filter((r) => r.status === "present").length,
        absentCount: records.filter((r) => r.status === "absent").length,
        lateCount: records.filter((r) => r.status === "late").length,
        excusedCount: records.filter((r) => r.status === "excused").length,
        totalStudents: records.length,
      };
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getAttendanceSessionsForBatch(
  batchId: string
): BatchAttendanceSession[] {
  return getAllAttendanceSessions().filter(
    (session) => session.batchId === batchId
  );
}

export function getMonthlyAttendanceStats(
  monthsBack = 6
): MonthlyAttendanceSummary[] {
  const today = new Date();
  const results: MonthlyAttendanceSummary[] = [];

  for (let offset = monthsBack - 1; offset >= 0; offset--) {
    const monthDate = new Date(today.getFullYear(), today.getMonth() - offset, 1);
    const monthKey = toMonthKey(monthDate);
    const monthRecords = mockAttendanceRecords.filter(
      (record) => toMonthKey(new Date(record.date)) === monthKey
    );

    results.push({
      month: monthKey,
      averagePercentage: calculateAttendancePercentage(monthRecords),
      totalRecords: monthRecords.length,
    });
  }

  return results;
}
