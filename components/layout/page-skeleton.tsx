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

      <PageBodySkeleton statCards={statCards} rows={rows} />
    </PageContainer>
  );
}

// Same as PageSkeleton but without the header placeholder — for routes
// where the real PageHeader now renders immediately (outside Suspense) and
// only the data-dependent body streams in behind a section-level fallback.
export function PageBodySkeleton({ statCards = 4, rows = 6 }: PageSkeletonProps) {
  return (
    <>
      {statCards > 0 && (
        <StatCardGrid>
          {Array.from({ length: statCards }).map((_, index) => (
            <div
              key={index}
              className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4"
            >
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-7 w-16" />
            </div>
          ))}
        </StatCardGrid>
      )}

      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex flex-col gap-4">
          {Array.from({ length: rows }).map((_, index) => (
            <Skeleton key={index} className="h-12 w-full rounded-xl" />
          ))}
        </div>
      </div>
    </>
  );
}
