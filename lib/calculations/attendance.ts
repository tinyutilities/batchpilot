import type { AttendanceRecord, AttendanceStatsData } from "@/types/attendance";
import type { WeekDay } from "@/types/batch";

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

export function getWeekDayForDateKey(date: string): WeekDay {
  const [year, month, day] = date.split("-").map(Number);
  return getWeekDay(new Date(year, month - 1, day));
}

// Excused days don't count against a student; late still counts as attended.
export function calculateAttendancePercentage(
  records: AttendanceRecord[],
): number {
  const countable = records.filter((record) => record.status !== "excused");
  if (countable.length === 0) return 0;

  const attended = countable.filter(
    (record) => record.status === "present" || record.status === "late",
  ).length;
  return Math.round((attended / countable.length) * 100);
}

export function computeAttendanceStats(
  records: AttendanceRecord[],
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
