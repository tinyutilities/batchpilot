import { Layers, CheckCircle2, Users, Gauge } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { StatCardGrid } from "@/components/dashboard/stat-card-grid";
import type { BatchStatsProps } from "@/types/batch";

export default function BatchStats({ stats }: BatchStatsProps) {
  return (
    <StatCardGrid>
      <StatCard
        title="Total Batches"
        value={stats.totalBatches}
        description="Across all subjects"
        icon={<Layers className="h-5 w-5" />}
        color="indigo"
      />
      <StatCard
        title="Active Batches"
        value={stats.activeBatches}
        description={`${stats.totalBatches - stats.activeBatches} inactive`}
        icon={<CheckCircle2 className="h-5 w-5" />}
        color="green"
      />
      <StatCard
        title="Total Enrolled"
        value={stats.totalEnrolled}
        description="Across all batches"
        icon={<Users className="h-5 w-5" />}
        color="blue"
      />
      <StatCard
        title="Avg. Capacity Usage"
        value={`${stats.averageCapacityUsage}%`}
        description="Across active batches"
        icon={<Gauge className="h-5 w-5" />}
        color="amber"
      />
    </StatCardGrid>
  );
}
