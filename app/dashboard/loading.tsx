import { PageSkeleton } from "@/components/layout/page-skeleton";

export default function DashboardLoading() {
  return <PageSkeleton statCards={4} rows={4} />;
}
