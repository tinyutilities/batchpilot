import { Skeleton } from "@/components/ui/skeleton";
import { StatCardGrid } from "@/components/dashboard/stat-card-grid";

// Section-level fallbacks for the Dashboard's two independent Suspense
// boundaries. Reuse the same border/bg/rounded classes PageSkeleton already
// uses (app/dashboard/loading.tsx via components/layout/page-skeleton.tsx)
// so these read as a natural extension of the existing skeleton, not a new
// visual design.

export function DashboardMainSkeleton() {
  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex flex-col gap-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-12 w-full rounded-xl" />
          ))}
        </div>
      </div>

      <StatCardGrid>
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4"
          >
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-7 w-16" />
          </div>
        ))}
      </StatCardGrid>

      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex flex-col gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-12 w-full rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function DashboardTrendsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="rounded-2xl border border-border bg-card p-5 shadow-raised"
        >
          <Skeleton className="mb-4 h-4 w-32" />
          <Skeleton className="h-40 w-full rounded-xl" />
        </div>
      ))}
    </div>
  );
}
