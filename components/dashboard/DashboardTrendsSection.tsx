import { getDashboardTrends } from "@/server/dashboard/queries";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import PerformanceChart from "@/components/shared/PerformanceChart";

// Streamed in via its own Suspense boundary, separate from
// DashboardMainSection: unlike stats/schedule/activity, this runs its own
// independent month-range queries (getMonthlyAttendanceStats,
// getMonthlyCollectionStats, getMonthlyTestSummaries) that nothing else on
// the dashboard shares, making it a genuinely separate — and typically the
// slowest — unit of work, plus a visually self-contained block (the bottom
// 3-chart grid) with no layout dependency on the sections above it.
export default async function DashboardTrendsSection({
  teacherId,
}: {
  teacherId: string;
}) {
  const trends = await getDashboardTrends(teacherId, 6);

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
      <DashboardCard
        title="Attendance Trend"
        description="Average attendance over the last 6 months"
      >
        <PerformanceChart
          data={trends.attendance}
          emptyMessage="No attendance data yet."
        />
      </DashboardCard>

      <DashboardCard
        title="Fee Collection Trend"
        description="Collection rate over the last 6 months"
      >
        <PerformanceChart
          data={trends.feeCollection}
          emptyMessage="No fee data yet."
        />
      </DashboardCard>

      <DashboardCard
        title="Marks Trend"
        description="Average test performance over the last 6 months"
      >
        <PerformanceChart
          data={trends.marks}
          emptyMessage="No marks data yet."
        />
      </DashboardCard>
    </div>
  );
}
