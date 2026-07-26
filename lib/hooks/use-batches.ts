"use client";

import useSWR from "swr";
import { fetchBatches, fetchBatchEnrollmentCounts } from "@/server/batches/actions";
import type { Batch } from "@/types/batch";

export function useBatches(
  fallbackBatches: Batch[],
  fallbackEnrollmentCounts: Record<string, number>,
) {
  const batchesSWR = useSWR<Batch[]>("batches", fetchBatches, {
    fallbackData: fallbackBatches,
  });
  const enrollmentSWR = useSWR<Record<string, number>>(
    "batch-enrollment-counts",
    fetchBatchEnrollmentCounts,
    { fallbackData: fallbackEnrollmentCounts },
  );

  return {
    batches: batchesSWR.data ?? fallbackBatches,
    enrollmentCounts: enrollmentSWR.data ?? fallbackEnrollmentCounts,
    mutate: batchesSWR.mutate,
    mutateEnrollmentCounts: enrollmentSWR.mutate,
    isLoading: batchesSWR.isLoading || enrollmentSWR.isLoading,
  };
}
