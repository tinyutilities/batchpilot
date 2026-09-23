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
    // fallbackData is the same request's server-rendered result — trust it
    // instead of immediately re-fetching on mount. Explicit mutate() calls
    // (e.g. globalMutate(DASHBOARD_STATS_KEY) after a payment) still work;
    // this only disables the automatic mount/focus/reconnect revalidation.
    { fallbackData, revalidateIfStale: false },
  );

  return { stats: data ?? fallbackData, mutate, isLoading };
}
