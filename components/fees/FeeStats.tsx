import { AlertTriangle, CheckCircle2, Clock3, Wallet } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { StatCardGrid } from "@/components/dashboard/stat-card-grid";
import type { FeeStatsProps } from "@/types/fees";

export default function FeeStats({ stats }: FeeStatsProps) {
  return (
    <StatCardGrid>
      <StatCard
        title="Total Collected"
        value={`₹${stats.totalCollected.toLocaleString("en-IN")}`}
        description={`${stats.collectionRate}% collection rate`}
        icon={<Wallet className="h-5 w-5" />}
        color="green"
      />
      <StatCard
        title="Pending Amount"
        value={`₹${stats.pendingAmount.toLocaleString("en-IN")}`}
        description={`${stats.studentsPending} students pending`}
        icon={<Clock3 className="h-5 w-5" />}
        color="amber"
      />
      <StatCard
        title="Overdue Amount"
        value={`₹${stats.overdueAmount.toLocaleString("en-IN")}`}
        description="Past due date"
        icon={<AlertTriangle className="h-5 w-5" />}
        color="rose"
      />
      <StatCard
        title="Students Paid"
        value={stats.studentsPaid}
        description="Fully paid this period"
        icon={<CheckCircle2 className="h-5 w-5" />}
        color="indigo"
      />
    </StatCardGrid>
  );
}
