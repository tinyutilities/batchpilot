import { CheckCircle2, Clock, ShieldCheck, XCircle } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { StatCardGrid } from "@/components/dashboard/stat-card-grid";
import type { AttendanceStatsProps } from "@/types/attendance";

export default function AttendanceStats({ stats }: AttendanceStatsProps) {
  return (
    <StatCardGrid>
      <StatCard
        title="Present"
        value={stats.presentCount}
        description={`${stats.totalRecords} records total`}
        icon={<CheckCircle2 className="h-5 w-5" />}
        color="green"
      />
      <StatCard
        title="Absent"
        value={stats.absentCount}
        description={`${stats.lateCount} late, ${stats.excusedCount} excused`}
        icon={<XCircle className="h-5 w-5" />}
        color="rose"
      />
      <StatCard
        title="Late"
        value={stats.lateCount}
        description="Across all batches"
        icon={<Clock className="h-5 w-5" />}
        color="amber"
      />
      <StatCard
        title="Avg. Attendance"
        value={`${stats.averageAttendancePercentage}%`}
        description="Present + late only"
        icon={<ShieldCheck className="h-5 w-5" />}
        color="indigo"
      />
    </StatCardGrid>
  );
}
