import { Users, UserCheck, CalendarCheck, Wallet } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { StatCardGrid } from "@/components/dashboard/stat-card-grid";
import type { StudentStatsProps } from "@/types/student";

export default function StudentStats({ stats }: StudentStatsProps) {
  const activePercentage =
    stats.totalStudents > 0
      ? Math.round((stats.activeStudents / stats.totalStudents) * 100)
      : 0;

  return (
    <StatCardGrid>
      <StatCard
        title="Total Students"
        value={stats.totalStudents}
        description="Across all batches"
        icon={<Users className="h-5 w-5" />}
        color="indigo"
      />
      <StatCard
        title="Active Students"
        value={stats.activeStudents}
        description={`${activePercentage}% of total`}
        icon={<UserCheck className="h-5 w-5" />}
        color="green"
      />
      <StatCard
        title="Average Attendance"
        value={`${stats.averageAttendance}%`}
        description="Last 30 days"
        icon={<CalendarCheck className="h-5 w-5" />}
        color="blue"
      />
      <StatCard
        title="Pending Fees"
        value={`₹${stats.pendingFeesAmount.toLocaleString("en-IN")}`}
        description={`${stats.pendingFeesCount} students pending`}
        icon={<Wallet className="h-5 w-5" />}
        color="amber"
      />
    </StatCardGrid>
  );
}
