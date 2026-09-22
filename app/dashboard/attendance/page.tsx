import { Suspense } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { redirect } from "next/navigation";
import { getCurrentTeacher } from "@/server/auth/get-current-teacher";
import {
  getAllAttendanceSessions,
  getScheduledBatchesForDate,
  getTodayAttendanceSummary,
} from "@/server/attendance/queries";
import { getAllBatches } from "@/server/batches/queries";
import { getAllStudents } from "@/server/students/queries";
import { computeAttendanceStats } from "@/lib/calculations/attendance";
import { toDateKey } from "@/lib/utils";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { PageBodySkeleton } from "@/components/layout/page-skeleton";
import { Button } from "@/components/ui/button";
import AttendancePageClient from "@/components/attendance/AttendancePageClient";

// The header is static (title/description) plus a plain navigation Link —
// nothing here depends on the queries below, so it renders immediately
// instead of waiting on them like the old single-component page did. Only
// the data-dependent body streams in behind Suspense.
async function AttendanceBody({ teacherId }: { teacherId: string }) {
  const today = toDateKey(new Date());

  const [allSessions, todaySummary, scheduledToday, batches, students] = await Promise.all([
    getAllAttendanceSessions(teacherId),
    getTodayAttendanceSummary(teacherId),
    getScheduledBatchesForDate(teacherId, today),
    getAllBatches(teacherId),
    // Attendance records only carry studentId — needed to resolve real
    // names for the CSV export rather than exporting IDs.
    getAllStudents(teacherId),
  ]);

  const stats = computeAttendanceStats(allSessions.flatMap((session) => session.records));
  const todayMarkedBatchIds = allSessions
    .filter((session) => session.date === today)
    .map((session) => session.batchId);
  const studentNameById: Record<string, string> = {};
  students.forEach((s) => {
    studentNameById[s.id] = s.fullName;
  });

  return (
    <AttendancePageClient
      allSessions={allSessions}
      stats={stats}
      todaySummary={todaySummary}
      scheduledToday={scheduledToday}
      todayMarkedBatchIds={todayMarkedBatchIds}
      batches={batches}
      studentNameById={studentNameById}
    />
  );
}

export default async function AttendancePage() {
  const teacher = await getCurrentTeacher();
  if (!teacher) {
    redirect("/auth/login");
  }

  return (
    <PageContainer>
      <PageHeader
        title="Attendance"
        description="Mark and review student attendance across all batches."
        action={
          <Button asChild className="h-11 gap-2 rounded-xl">
            <Link href="/dashboard/attendance/mark">
              <Plus className="h-4 w-4" aria-hidden="true" />
              Mark Attendance
            </Link>
          </Button>
        }
      />

      <Suspense fallback={<PageBodySkeleton statCards={4} rows={6} />}>
        <AttendanceBody teacherId={teacher.id} />
      </Suspense>
    </PageContainer>
  );
}
