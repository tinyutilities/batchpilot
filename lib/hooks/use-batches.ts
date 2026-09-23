"use client";

import useSWR from "swr";
import { fetchBatches, fetchBatchEnrollmentCounts } from "@/server/batches/actions";
import type { Batch } from "@/types/batch";

export function useBatches(
  fallbackBatches: Batch[],
  fallbackEnrollmentCounts: Record<string, number>,
) {
  // Both fallbacks are this request's server-rendered results — trust them
  // instead of immediately re-fetching on mount. Explicit mutate() calls
  // still work; this only disables automatic mount/focus/reconnect refetch.
  const batchesSWR = useSWR<Batch[]>("batches", fetchBatches, {
    fallbackData: fallbackBatches,
    revalidateIfStale: false,
  });
  const enrollmentSWR = useSWR<Record<string, number>>(
    "batch-enrollment-counts",
    fetchBatchEnrollmentCounts,
    { fallbackData: fallbackEnrollmentCounts, revalidateIfStale: false },
  );

  return {
    batches: batchesSWR.data ?? fallbackBatches,
    enrollmentCounts: enrollmentSWR.data ?? fallbackEnrollmentCounts,
    mutate: batchesSWR.mutate,
    mutateEnrollmentCounts: enrollmentSWR.mutate,
    isLoading: batchesSWR.isLoading || enrollmentSWR.isLoading,
  };
}
