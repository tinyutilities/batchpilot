import {
  CalendarCheck,
  ClipboardCheck,
  ClipboardList,
  Layers,
  TrendingUp,
  Users,
  Wallet,
  Clock3,
} from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { StatCardGrid } from "@/components/dashboard/stat-card-grid";
import type { DashboardStatsData } from "@/types/dashboard";

interface DashboardStatsProps {
  stats: DashboardStatsData;
}

export default function DashboardStats({ stats }: DashboardStatsProps) {
  return (
    <StatCardGrid>
      <StatCard
        title="Total Students"
        value={stats.totalStudents}
        icon={<Users className="h-5 w-5" />}
        color="blue"
      />
      <StatCard
        title="Active Batches"
        value={stats.activeBatches}
        icon={<Layers className="h-5 w-5" />}
        color="indigo"
      />
      <StatCard
        title="Today's Classes"
        value={stats.todaysClasses}
        icon={<CalendarCheck className="h-5 w-5" />}
        color="green"
      />
      <StatCard
        title="Attendance Today"
        value={`${stats.attendanceTodayMarked}/${stats.attendanceTodayTotal} marked`}
        icon={<ClipboardCheck className="h-5 w-5" />}
        color="violet"
      />
      <StatCard
        title="Monthly Fee Collection"
        value={`₹${stats.monthlyCollection.toLocaleString("en-IN")}`}
        icon={<Wallet className="h-5 w-5" />}
        color="green"
      />
      <StatCard
        title="Pending Fees"
        value={`₹${stats.pendingFees.toLocaleString("en-IN")}`}
        icon={<Clock3 className="h-5 w-5" />}
        color="amber"
      />
      <StatCard
        title="Tests This Month"
        value={stats.testsThisMonth}
        icon={<ClipboardList className="h-5 w-5" />}
        color="indigo"
      />
      <StatCard
        title="Average Marks"
        value={`${stats.averageMarksPercentage}%`}
        icon={<TrendingUp className="h-5 w-5" />}
        color="blue"
      />
    </StatCardGrid>
  );
}
