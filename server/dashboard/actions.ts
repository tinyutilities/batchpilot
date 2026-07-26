"use server";

import { getCurrentTeacher } from "@/server/auth/get-current-teacher";
import { getDashboardStats } from "@/server/dashboard/queries";
import type { DashboardStatsData } from "@/types/dashboard";

// Client-callable wrapper for the SWR cache layer — lets other pages (e.g.
// Fees, after recording a payment) invalidate the dashboard's cached stats
// via the shared "dashboard-stats" key, even while the Dashboard itself
// isn't mounted.
export async function fetchDashboardStats(): Promise<DashboardStatsData> {
  const teacher = await getCurrentTeacher();
  if (!teacher) throw new Error("Not authenticated");
  return getDashboardStats(teacher.id);
}
