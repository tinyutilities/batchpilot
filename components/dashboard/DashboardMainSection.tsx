import { getDashboardStats, getRecentActivity, getTodaySchedule } from "@/server/dashboard/queries";
import TodaySchedule from "@/components/dashboard/TodaySchedule";
import QuickActions from "@/components/dashboard/QuickActions";
import RecentActivity from "@/components/dashboard/RecentActivity";
import DashboardStatsLive from "@/components/dashboard/DashboardStatsLive";

interface DashboardMainSectionProps {
  teacherId: string;
  today: string;
}

// Stats, today's schedule and recent activity all read from the same
// request-level cache()-deduped datasets (getAllStudents, getAllBatches,
// getAllAttendanceSessions, getAllTests, getAllMarks, etc. — see
// server/*/queries.ts), so fetching them together here costs the same as
// fetching any single one of them: the underlying queries only ever run
// once per request either way. Splitting these three into separate Suspense
// boundaries would add complexity without changing when they actually
// become ready, since they share their slow part (the DB round trips).
//
// Trends is deliberately NOT fetched here — see DashboardTrendsSection,
// which streams in independently because it runs its own separate
// month-range queries that aren't part of this shared data.
export default async function DashboardMainSection({
  teacherId,
  today,
}: DashboardMainSectionProps) {
  const [stats, schedule, activity] = await Promise.all([
    getDashboardStats(teacherId),
    getTodaySchedule(teacherId),
    getRecentActivity(teacherId, 8),
  ]);

  return (
    <>
      <TodaySchedule schedule={schedule} today={today} />
      <QuickActions />
      <DashboardStatsLive initialStats={stats} />
      <RecentActivity activity={activity} />
    </>
  );
}
