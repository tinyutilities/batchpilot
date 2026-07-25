import { PageSkeleton } from "@/components/layout/page-skeleton";

export default function AttendanceLoading() {
  return <PageSkeleton statCards={4} rows={6} />;
}
