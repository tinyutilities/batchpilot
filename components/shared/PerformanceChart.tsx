import { cn } from "@/lib/utils";

interface PerformanceChartProps {
  data: { label: string; percentage: number }[];
  emptyMessage?: string;
}

// Same 90/75/50 tiers and token mapping used by the attendance/capacity/
// score gradients elsewhere (StudentTable, BatchCard, MarksTable,
// AttendanceTable, FeesPageClient) — keeps every "gradient of performance"
// indicator in the app reading the same way.
function getBarColor(percentage: number) {
  if (percentage >= 90) return "bg-success";
  if (percentage >= 75) return "bg-secondary-foreground";
  if (percentage >= 50) return "bg-warning";
  return "bg-destructive";
}

export default function PerformanceChart({
  data,
  emptyMessage = "No performance data yet.",
}: PerformanceChartProps) {
  if (data.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyMessage}</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {data.map((point, index) => (
        <div key={`${point.label}-${index}`} className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-foreground">{point.label}</span>
            <span className="text-muted-foreground">{point.percentage}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={cn(
                "h-full rounded-full",
                getBarColor(point.percentage)
              )}
              style={{ width: `${Math.min(point.percentage, 100)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
