"use client";

import useSWR from "swr";
import { fetchFeeTableRows, fetchBatchFeeGrid } from "@/server/fees/actions";
import type { BatchFeeGridRow, FeeTableRow } from "@/types/fees";

export function useFeeRows(fallbackData: FeeTableRow[]) {
  const { data, mutate, isLoading } = useSWR<FeeTableRow[]>(
    "fee-rows",
    fetchFeeTableRows,
    { fallbackData },
  );

  return { rows: data ?? fallbackData, mutate, isLoading };
}

// batchId === null skips fetching entirely (e.g. while the "All Fees" flat
// view is active and no batch is selected for the grid).
export function useBatchFeeGrid(batchId: string | null, fallbackData: BatchFeeGridRow[]) {
  const { data, mutate, isLoading } = useSWR<BatchFeeGridRow[]>(
    batchId ? ["batch-fee-grid", batchId] : null,
    batchId ? () => fetchBatchFeeGrid(batchId) : null,
    { fallbackData },
  );

  return { rows: data ?? fallbackData, mutate, isLoading };
}
