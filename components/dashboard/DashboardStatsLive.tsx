"use client";

import DashboardStats from "@/components/dashboard/DashboardStats";
import { useDashboardStats } from "@/lib/hooks/use-dashboard-stats";
import type { DashboardStatsData } from "@/types/dashboard";

// Thin client boundary around just the stats grid — this is the one piece
// of the dashboard body that needs to live-update on the client (e.g. the
// Fees page calls globalMutate(DASHBOARD_STATS_KEY) after recording a
// payment, while the Dashboard may not even be mounted). Everything else in
// DashboardMainSection stays a plain Server Component; behavior here is
// unchanged from before — same useDashboardStats hook, same fallbackData.
export default function DashboardStatsLive({
  initialStats,
}: {
  initialStats: DashboardStatsData;
}) {
  const { stats } = useDashboardStats(initialStats);
  return <DashboardStats stats={stats} />;
}
