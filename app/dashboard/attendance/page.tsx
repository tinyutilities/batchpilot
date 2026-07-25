import { redirect } from "next/navigation";
import { getCurrentTeacher } from "@/server/auth/get-current-teacher";
import {
  getAllAttendanceSessions,
  getScheduledBatchesForDate,
  getTodayAttendanceSummary,
} from "@/server/attendance/queries";
import { getAllBatches } from "@/server/batches/queries";
import { computeAttendanceStats } from "@/lib/calculations/attendance";
import { toDateKey } from "@/lib/utils";
import AttendancePageClient from "@/components/attendance/AttendancePageClient";

export default async function AttendancePage() {
  const teacher = await getCurrentTeacher();
  if (!teacher) {
    redirect("/auth/login");
  }

  const today = toDateKey(new Date());

  const [allSessions, todaySummary, scheduledToday, batches] = await Promise.all([
    getAllAttendanceSessions(teacher.id),
    getTodayAttendanceSummary(teacher.id),
    getScheduledBatchesForDate(teacher.id, today),
    getAllBatches(teacher.id),
  ]);

  const stats = computeAttendanceStats(allSessions.flatMap((session) => session.records));
  const todayMarkedBatchIds = allSessions
    .filter((session) => session.date === today)
    .map((session) => session.batchId);

  return (
    <AttendancePageClient
      allSessions={allSessions}
      stats={stats}
      todaySummary={todaySummary}
      scheduledToday={scheduledToday}
      todayMarkedBatchIds={todayMarkedBatchIds}
      batches={batches}
    />
  );
}
