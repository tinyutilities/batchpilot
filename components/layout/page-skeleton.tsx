import { PageContainer } from "@/components/layout/page-container";
import { StatCardGrid } from "@/components/dashboard/stat-card-grid";
import { Skeleton } from "@/components/ui/skeleton";

interface PageSkeletonProps {
  statCards?: number;
  rows?: number;
}

export function PageSkeleton({ statCards = 4, rows = 6 }: PageSkeletonProps) {
  return (
    <PageContainer aria-hidden="true">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>

      {statCards > 0 && (
        <StatCardGrid>
          {Array.from({ length: statCards }).map((_, index) => (
            <div
              key={index}
              className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950"
            >
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-7 w-16" />
            </div>
          ))}
        </StatCardGrid>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950">
        <div className="flex flex-col gap-4">
          {Array.from({ length: rows }).map((_, index) => (
            <Skeleton key={index} className="h-12 w-full rounded-xl" />
          ))}
        </div>
      </div>
    </PageContainer>
  );
}
