"use client";

import useSWR from "swr";
import { fetchFeeTableRows, fetchBatchFeeGrid } from "@/server/fees/actions";
import type { BatchFeeGridRow, FeeTableRow } from "@/types/fees";

export function useFeeRows(fallbackData: FeeTableRow[]) {
  const { data, mutate, isLoading } = useSWR<FeeTableRow[]>(
    "fee-rows",
    fetchFeeTableRows,
    // fallbackData is this request's server-rendered result — trust it
    // instead of immediately re-fetching on mount. Explicit mutate() calls
    // still work; this only disables automatic mount/focus/reconnect refetch.
    { fallbackData, revalidateIfStale: false },
  );

  return { rows: data ?? fallbackData, mutate, isLoading };
}

// batchId === null skips fetching entirely (e.g. while the "All Fees" flat
// view is active and no batch is selected for the grid).
//
// NOTE: unlike the other hooks in this module, fallbackData here is *not*
// server-rendered data — FeesPageClient always passes `[]` and this hook
// fetches purely client-side once a batch is selected. Do NOT add
// `revalidateIfStale: false` here: SWR only skips the mount fetch when
// fallbackData is already defined, and `[]` counts as defined, so it would
// permanently suppress the first real fetch for every newly-selected batch.
export function useBatchFeeGrid(batchId: string | null, fallbackData: BatchFeeGridRow[]) {
  const { data, mutate, isLoading } = useSWR<BatchFeeGridRow[]>(
    batchId ? ["batch-fee-grid", batchId] : null,
    batchId ? () => fetchBatchFeeGrid(batchId) : null,
    { fallbackData },
  );

  return { rows: data ?? fallbackData, mutate, isLoading };
}
