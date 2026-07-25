"use client";

import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import DashboardStats from "@/components/dashboard/DashboardStats";
import TodaySchedule from "@/components/dashboard/TodaySchedule";
import RecentActivity from "@/components/dashboard/RecentActivity";
import QuickActions from "@/components/dashboard/QuickActions";
import PerformanceChart from "@/components/shared/PerformanceChart";
import type { ActivityItem, DashboardStatsData, DashboardTrends, ScheduleEntry } from "@/types/dashboard";

interface DashboardPageClientProps {
  greeting: string;
  firstName: string;
  today: string;
  stats: DashboardStatsData;
  schedule: ScheduleEntry[];
  activity: ActivityItem[];
  trends: DashboardTrends;
}

export default function DashboardPageClient({
  greeting,
  firstName,
  today,
  stats,
  schedule,
  activity,
  trends,
}: DashboardPageClientProps) {
  return (
    <PageContainer>
      <PageHeader
        title={`${greeting}, ${firstName} 👋`}
        description="Here's an overview of your tuition classes."
      />

      <TodaySchedule schedule={schedule} today={today} />

      <QuickActions />

      <DashboardStats stats={stats} />

      <RecentActivity activity={activity} />

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
    </PageContainer>
  );
}
