"use client";

import { useMemo } from "react";
import {
  Users,
  UsersRound,
  Layers,
  CalendarCheck,
  ClipboardList,
  Wallet,
} from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { StatCardGrid } from "@/components/dashboard/stat-card-grid";
import { getAdminOverviewStats } from "@/lib/mock/admin";

export default function AdminOverviewPage() {
  const stats = useMemo(() => getAdminOverviewStats(), []);

  return (
    <PageContainer>
      <PageHeader
        title="Admin Overview"
        description="Platform-wide statistics across every teacher's workspace."
      />

      <StatCardGrid columns={3}>
        <StatCard
          title="Total Teachers"
          value={stats.totalTeachers}
          description={`${stats.activeTeachers} active`}
          icon={<Users className="h-5 w-5" />}
          color="indigo"
        />
        <StatCard
          title="Total Students"
          value={stats.totalStudents}
          icon={<UsersRound className="h-5 w-5" />}
          color="blue"
        />
        <StatCard
          title="Total Batches"
          value={stats.totalBatches}
          icon={<Layers className="h-5 w-5" />}
          color="violet"
        />
        <StatCard
          title="Attendance Records"
          value={stats.totalAttendanceRecords}
          icon={<CalendarCheck className="h-5 w-5" />}
          color="green"
        />
        <StatCard
          title="Tests"
          value={stats.totalTests}
          icon={<ClipboardList className="h-5 w-5" />}
          color="amber"
        />
        <StatCard
          title="Fee Records"
          value={stats.totalFeeRecords}
          icon={<Wallet className="h-5 w-5" />}
          color="rose"
        />
      </StatCardGrid>
    </PageContainer>
  );
}
