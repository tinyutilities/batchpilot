"use client";

import useSWR from "swr";
import { fetchDashboardStats } from "@/server/dashboard/actions";
import type { DashboardStatsData } from "@/types/dashboard";

// Exported so other pages (e.g. Fees, after recording a payment) can
// invalidate this cache entry via SWR's global `mutate(DASHBOARD_STATS_KEY)`
// without needing the Dashboard to be mounted.
export const DASHBOARD_STATS_KEY = "dashboard-stats";

export function useDashboardStats(fallbackData: DashboardStatsData) {
  const { data, mutate, isLoading } = useSWR<DashboardStatsData>(
    DASHBOARD_STATS_KEY,
    fetchDashboardStats,
    { fallbackData },
  );

  return { stats: data ?? fallbackData, mutate, isLoading };
}
