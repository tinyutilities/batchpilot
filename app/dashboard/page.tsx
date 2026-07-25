"use client";

import { useMemo } from "react";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import DashboardStats from "@/components/dashboard/DashboardStats";
import TodaySchedule from "@/components/dashboard/TodaySchedule";
import RecentActivity from "@/components/dashboard/RecentActivity";
import QuickActions from "@/components/dashboard/QuickActions";
import WelcomeOnboarding from "@/components/dashboard/WelcomeOnboarding";
import PerformanceChart from "@/components/shared/PerformanceChart";
import {
  getDashboardStats,
  getDashboardTrends,
  getRecentActivity,
  getTimeOfDayGreeting,
  getTodaySchedule,
} from "@/lib/mock/dashboard";
import { toDateKey } from "@/lib/mock/attendance";
import { mockBatches } from "@/lib/mock/batch";
import { mockStudents } from "@/lib/mock/student";
import { getTeacherFirstName } from "@/lib/mock/teacher";
import { useTeacherSettings } from "@/lib/hooks/use-teacher-settings";

export default function DashboardPage() {
  const today = useMemo(() => toDateKey(new Date()), []);
  const stats = useMemo(() => getDashboardStats(), []);
  const schedule = useMemo(() => getTodaySchedule(), []);
  const activity = useMemo(() => getRecentActivity(8), []);
  const trends = useMemo(() => getDashboardTrends(6), []);
  const greeting = useMemo(() => getTimeOfDayGreeting(), []);
  const { profile } = useTeacherSettings();
  const firstName = getTeacherFirstName(profile.fullName) || "Teacher";

  // A brand-new teacher has created nothing at all yet — show onboarding
  // instead of an analytics dashboard full of meaningless zeros. Checked
  // against total batches/students (not just "active" ones) so a batch
  // that exists but is marked inactive still counts as "not new".
  const isNewUser = mockBatches.length === 0 && mockStudents.length === 0;

  if (isNewUser) {
    return <WelcomeOnboarding />;
  }

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
