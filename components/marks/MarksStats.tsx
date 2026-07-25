import { ArrowDown, ArrowUp, ClipboardList, TrendingUp } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { StatCardGrid } from "@/components/dashboard/stat-card-grid";
import type { MarksStatsProps } from "@/types/marks";

export default function MarksStats({ stats }: MarksStatsProps) {
  return (
    <StatCardGrid>
      <StatCard
        title="Tests Conducted"
        value={stats.totalTests}
        description={`${stats.passRate}% pass rate`}
        icon={<ClipboardList className="h-5 w-5" />}
        color="indigo"
      />
      <StatCard
        title="Average Score"
        value={`${stats.averagePercentage}%`}
        description="Across all tests"
        icon={<TrendingUp className="h-5 w-5" />}
        color="blue"
      />
      <StatCard
        title="Highest Score"
        value={`${stats.highestPercentage}%`}
        icon={<ArrowUp className="h-5 w-5" />}
        color="green"
      />
      <StatCard
        title="Lowest Score"
        value={`${stats.lowestPercentage}%`}
        icon={<ArrowDown className="h-5 w-5" />}
        color="rose"
      />
    </StatCardGrid>
  );
}
