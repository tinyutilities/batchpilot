"use client";

import { startTransition, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { mutate as globalMutate } from "swr";
import { Download, ReceiptText } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { ModuleAlertBanner } from "@/components/dashboard/ModuleAlertBanner";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import FeeStats from "@/components/fees/FeeStats";
import FeeFilters from "@/components/fees/FeeFilters";
import FeeTable from "@/components/fees/FeeTable";
import BatchMonthFeeTable from "@/components/fees/BatchMonthFeeTable";
import PaymentDialog from "@/components/fees/PaymentDialog";
import {
  getOrCreateFeeForMonth,
  initializeFeesForBatchMonth,
  recordPayment,
} from "@/server/fees/actions";
import { useBatchFeeGrid, useFeeRows } from "@/lib/hooks/use-fees";
import { useDebouncedValue } from "@/lib/hooks/use-debounced-value";
import { DASHBOARD_STATS_KEY } from "@/lib/hooks/use-dashboard-stats";
import { downloadCsv, toCsv } from "@/lib/csv";
import {
  computeFeeStats,
  computeFeeStatus,
  computeMonthlyCollectionStats,
  monthLabel,
} from "@/lib/calculations/fees";
import { toDateKey, toMonthKey } from "@/lib/utils";
import type { FeeRecord, FeeTableRow, PaymentInput } from "@/types/fees";
import type { Batch } from "@/types/batch";

const DEFAULT_MONTHLY_FEE = 3000;
const DEFAULT_SORT = "dueDate-desc";

function currentMonthKey() {
  return toMonthKey(new Date());
}

// Rolling 6-month window ending at the current month, newest first — same
// range getBatchFeeGrid already computes server-side, mirrored here so the
// Month selector has options before the grid data has loaded.
function recentMonthOptions(): string[] {
  const today = new Date();
  return Array.from({ length: 6 }, (_, i) =>
    toMonthKey(new Date(today.getFullYear(), today.getMonth() - i, 1)),
  );
}

function getRateColor(percentage: number) {
  if (percentage >= 90) return "bg-success";
  if (percentage >= 70) return "bg-secondary-foreground";
  if (percentage >= 40) return "bg-warning";
  return "bg-destructive";
}

interface FeesPageClientProps {
  initialRows: FeeTableRow[];
  batches: Batch[];
  hasAnyStudents: boolean;
}

export default function FeesPageClient({
  initialRows,
  batches,
  hasAnyStudents,
}: FeesPageClientProps) {
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [selectedSort, setSelectedSort] = useState(DEFAULT_SORT);
  const [paymentTarget, setPaymentTarget] = useState<FeeTableRow | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const debouncedSearchTerm = useDebouncedValue(searchTerm, 275);
  const hasActiveFilters =
    searchTerm.trim() !== "" ||
    selectedBatch !== "all" ||
    selectedStatus !== "all" ||
    selectedMonth !== "all" ||
    selectedSort !== DEFAULT_SORT;

  // "all" = today's flat, filterable table (unchanged). Picking a specific
  // batch switches to the per-batch, single-month fee sheet instead.
  const [gridBatchId, setGridBatchId] = useState<string>("all");
  const [gridMonth, setGridMonth] = useState<string>(currentMonthKey());
  const selectedGridBatch =
    gridBatchId !== "all" ? batches.find((b) => b.id === gridBatchId) : undefined;
  const {
    rows: gridRows,
    mutate: mutateGrid,
    isLoading: isGridLoading,
  } = useBatchFeeGrid(gridBatchId !== "all" ? gridBatchId : null, []);
  const gridMonths = Array.from(
    new Set(gridRows.flatMap((row) => row.cells.map((cell) => cell.month))),
  );
  const gridMonthOptions = gridMonths.length > 0 ? gridMonths : recentMonthOptions();

  // The first time a teacher opens a batch for a given month, materialize
  // real Fee rows for every enrolled student (Pending, amount = the batch's
  // monthly fee) instead of leaving them purely virtual — see
  // initializeFeesForBatchMonth. Idempotent, so re-running on every
  // batch/month change is cheap and safe.
  //
  // Server Functions invoked from useEffect must be dispatched inside
  // startTransition in this Next.js version (see
  // node_modules/next/dist/docs/01-app/01-getting-started/07-mutating-data.md
  // "useEffect" section) — calling the action directly here was a silent
  // no-op with no thrown error, which is why fee rows never materialized.
  useEffect(() => {
    if (gridBatchId === "all") return;
    let cancelled = false;
    console.log("[FeesPageClient] initializing fees for batch/month", {
      gridBatchId,
      gridMonth,
    });
    startTransition(() => {
      initializeFeesForBatchMonth(gridBatchId, gridMonth)
        .then(() => {
          console.log("[FeesPageClient] fee initialization resolved", {
            gridBatchId,
            gridMonth,
          });
          if (!cancelled) mutateGrid();
        })
        .catch((error) => {
          console.error("[FeesPageClient] fee initialization failed", error);
          if (!cancelled) {
            toast.error("Couldn't set up this month's fees. Please refresh and try again.");
          }
        });
    });
    return () => {
      cancelled = true;
    };
  }, [gridBatchId, gridMonth, mutateGrid]);

  const { rows: allRows, mutate: mutateFeeRows } = useFeeRows(initialRows);
  const thisMonth = currentMonthKey();

  const overdueFees = useMemo(
    () => allRows.filter((row) => row.fee.status === "overdue").map((row) => row.fee),
    [allRows],
  );

  const stats = useMemo(() => {
    const currentMonthFees = allRows
      .filter((row) => row.fee.month === thisMonth)
      .map((row) => row.fee);
    return computeFeeStats(currentMonthFees);
  }, [allRows, thisMonth]);

  const monthlyStats = useMemo(
    () => computeMonthlyCollectionStats(allRows.map((row) => row.fee), 3),
    [allRows],
  );

  const months = useMemo(() => {
    return Array.from(new Set(allRows.map((row) => row.fee.month))).sort(
      (a, b) => (a < b ? 1 : -1),
    );
  }, [allRows]);

  const filteredRows = useMemo(() => {
    const query = debouncedSearchTerm.trim().toLowerCase();

    const filtered = allRows.filter((row) => {
      const matchesSearch =
        query.length === 0 ||
        row.studentName.toLowerCase().includes(query) ||
        row.batchName.toLowerCase().includes(query) ||
        monthLabel(row.fee.month).toLowerCase().includes(query) ||
        row.fee.status.toLowerCase().includes(query);
      const matchesBatch =
        selectedBatch === "all" || row.fee.batchId === selectedBatch;
      const matchesStatus =
        selectedStatus === "all" || row.fee.status === selectedStatus;
      const matchesMonth =
        selectedMonth === "all" || row.fee.month === selectedMonth;

      return matchesSearch && matchesBatch && matchesStatus && matchesMonth;
    });

    return [...filtered].sort((a, b) => {
      switch (selectedSort) {
        case "dueDate-asc":
          return a.fee.dueDate < b.fee.dueDate ? -1 : 1;
        case "dueDate-desc":
          return a.fee.dueDate < b.fee.dueDate ? 1 : -1;
        case "amount-desc":
          return b.fee.amount - a.fee.amount;
        case "amount-asc":
          return a.fee.amount - b.fee.amount;
        case "balance-desc":
          return (
            b.fee.amount - b.fee.amountPaid - (a.fee.amount - a.fee.amountPaid)
          );
        case "name-asc":
          return a.studentName.localeCompare(b.studentName);
        default:
          return 0;
      }
    });
  }, [
    allRows,
    debouncedSearchTerm,
    selectedBatch,
    selectedStatus,
    selectedMonth,
    selectedSort,
  ]);

  function handleResetFilters() {
    setSearchTerm("");
    setSelectedBatch("all");
    setSelectedStatus("all");
    setSelectedMonth("all");
    setSelectedSort(DEFAULT_SORT);
  }

  // Exports exactly what's currently filtered/sorted in the flat "All Fees"
  // view. The per-batch month grid (below) isn't covered by this button —
  // it's a different shape (student x month), not a row list, and adding a
  // second export there is a separate feature, not a filter this one needs
  // to respect.
  function handleExportFees() {
    setIsExporting(true);
    try {
      const csv = toCsv(filteredRows, [
        { header: "Student", value: (r) => r.studentName },
        { header: "Batch", value: (r) => r.batchName },
        { header: "Month", value: (r) => monthLabel(r.fee.month) },
        { header: "Expected", value: (r) => r.fee.amount },
        { header: "Paid", value: (r) => r.fee.amountPaid },
        {
          header: "Outstanding",
          value: (r) => r.fee.amount - r.fee.amountPaid,
        },
        { header: "Status", value: (r) => r.fee.status },
      ]);
      downloadCsv(`batchpilot-fees-${toDateKey(new Date())}.csv`, csv);
      toast.success(
        `Exported ${filteredRows.length} fee record${filteredRows.length === 1 ? "" : "s"}.`,
      );
    } catch {
      toast.error("Couldn't generate the export. Please try again.");
    } finally {
      setIsExporting(false);
    }
  }

  function handleViewStudent(row: FeeTableRow) {
    router.push(`/dashboard/students/${row.studentId}`);
  }

  function handleViewBatch(row: FeeTableRow) {
    router.push(`/dashboard/batches/${row.fee.batchId}`);
  }

  function handleRecordPayment(row: FeeTableRow) {
    setPaymentTarget(row);
  }

  async function handleSubmitPayment(input: PaymentInput) {
    if (!paymentTarget) return;
    setIsSubmitting(true);
    const payment = await recordPayment(paymentTarget.fee.id, input);
    if (payment) {
      toast.success(
        `₹${input.amount.toLocaleString("en-IN")} recorded for ${
          paymentTarget.studentName
        }.`
      );
      // Optimistically patch the flat list's matching row in place instead
      // of refetching everything; SWR still revalidates this key in the
      // background afterwards so the server stays the source of truth.
      mutateFeeRows(
        allRows.map((row) => {
          if (row.fee.id !== paymentTarget.fee.id) return row;
          const amountPaid = row.fee.amountPaid + input.amount;
          return {
            ...row,
            fee: {
              ...row.fee,
              amountPaid,
              status: computeFeeStatus({
                amount: row.fee.amount,
                amountPaid,
                dueDate: row.fee.dueDate,
              }),
            },
          };
        }),
      );
      mutateGrid();
      globalMutate(DASHBOARD_STATS_KEY);
    } else {
      toast.error("Couldn't record that payment. Please try again.");
    }
    setPaymentTarget(null);
    setIsSubmitting(false);
  }

  const paymentFee: FeeRecord | null = paymentTarget
    ? (allRows.find((row) => row.fee.id === paymentTarget.fee.id)?.fee ??
      paymentTarget.fee)
    : null;

  // Patches the affected cell(s) in the grid from authoritative post-mutation
  // FeeRecords (Mark Paid / Mark Pending / Mark All Paid) instead of
  // refetching the whole grid — eliminates the table-wide loading flicker.
  // mutateGrid's default revalidate:true still reconciles with the server
  // in the background afterward, same as the flat list's payment pattern.
  function handleGridFeesUpdated(updates: { studentId: string; fee: FeeRecord }[]) {
    if (updates.length === 0) return;
    const updateByStudent = new Map(updates.map((u) => [u.studentId, u.fee]));
    mutateGrid(
      gridRows.map((row) => {
        const fee = updateByStudent.get(row.studentId);
        if (!fee) return row;
        return {
          ...row,
          cells: row.cells.map((cell) =>
            cell.month === fee.month
              ? { month: cell.month, status: fee.status, feeId: fee.id, amount: fee.amount, amountPaid: fee.amountPaid }
              : cell,
          ),
        };
      }),
    );
    mutateFeeRows();
  }

  async function handleGridRecordPayment(
    studentId: string,
    studentName: string,
    month: string,
  ) {
    const fee = await getOrCreateFeeForMonth(studentId, month);
    if (!fee) {
      toast.error("Couldn't bill this student — check they're assigned to a batch.");
      return;
    }
    setPaymentTarget({
      fee,
      studentId,
      studentName,
      batchName: selectedGridBatch?.name ?? "",
    });
  }

  return (
    <>
      {overdueFees.length > 0 && (
        <ModuleAlertBanner
          severity="critical"
          title={`${overdueFees.length} overdue fee${overdueFees.length === 1 ? "" : "s"}`}
          description={`₹${overdueFees
            .reduce((sum, fee) => sum + (fee.amount - fee.amountPaid), 0)
            .toLocaleString("en-IN")} pending past the due date`}
        />
      )}

      {allRows.length > 0 && <FeeStats stats={stats} />}

      <DashboardCard
        title="Monthly Collection"
        description="Billed vs. collected for the last 3 months"
      >
        <div className="flex flex-col gap-4">
          {monthlyStats.map((entry) => (
            <div key={entry.month} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-foreground">
                  {monthLabel(entry.month)}
                </span>
                <span className="text-muted-foreground">
                  ₹{entry.collected.toLocaleString("en-IN")} / ₹
                  {entry.billed.toLocaleString("en-IN")} ({entry.collectionRate}
                  %)
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={cn(
                    "h-full rounded-full",
                    getRateColor(entry.collectionRate)
                  )}
                  style={{ width: `${Math.min(entry.collectionRate, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </DashboardCard>

      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="flex flex-col gap-2 sm:w-[240px]">
          <label
            htmlFor="fee-view-selector"
            className="text-sm font-medium text-foreground"
          >
            Batch
          </label>
          <Select value={gridBatchId} onValueChange={setGridBatchId}>
            <SelectTrigger id="fee-view-selector" className="h-11 w-full rounded-xl">
              <SelectValue placeholder="All Fees" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Fees</SelectItem>
              {batches.map((batch) => (
                <SelectItem key={batch.id} value={batch.id}>
                  {batch.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {gridBatchId !== "all" && (
          <div className="flex flex-col gap-2 sm:w-[200px]">
            <label
              htmlFor="fee-month-selector"
              className="text-sm font-medium text-foreground"
            >
              Month
            </label>
            <Select value={gridMonth} onValueChange={setGridMonth}>
              <SelectTrigger id="fee-month-selector" className="h-11 w-full rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {gridMonthOptions.map((month) => (
                  <SelectItem key={month} value={month}>
                    {monthLabel(month)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {gridBatchId === "all" ? (
        <>
          <div className="flex justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5 rounded-xl"
              disabled={isExporting || filteredRows.length === 0}
              onClick={handleExportFees}
            >
              <Download className="h-3.5 w-3.5" aria-hidden="true" />
              {isExporting ? "Exporting…" : "Export CSV"}
            </Button>
          </div>

          <FeeFilters
            searchTerm={searchTerm}
            selectedBatch={selectedBatch}
            selectedStatus={selectedStatus}
            selectedMonth={selectedMonth}
            selectedSort={selectedSort}
            batches={batches}
            months={months}
            hasActiveFilters={hasActiveFilters}
            onSearchChange={setSearchTerm}
            onBatchChange={setSelectedBatch}
            onStatusChange={setSelectedStatus}
            onMonthChange={setSelectedMonth}
            onSortChange={setSelectedSort}
            onReset={handleResetFilters}
          />

          {allRows.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-border bg-card px-6 py-10 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <ReceiptText
                  className="h-6 w-6 text-muted-foreground"
                  aria-hidden="true"
                />
              </div>
              <p className="text-sm font-medium text-foreground">
                No fee records yet
              </p>
              <p className="max-w-xs text-sm text-muted-foreground">
                Create a batch and add students before recording payments.
              </p>
              {!hasAnyStudents && (
                <Button asChild className="mt-2 h-11 rounded-xl">
                  <Link href="/dashboard/students?addStudent=1">Add Student</Link>
                </Button>
              )}
            </div>
          ) : (
            <FeeTable
              rows={filteredRows}
              isLoading={false}
              onViewStudent={handleViewStudent}
              onViewBatch={handleViewBatch}
              onRecordPayment={handleRecordPayment}
            />
          )}
        </>
      ) : (
        <>
          {selectedGridBatch && (
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-foreground">
                {selectedGridBatch.name}
              </h3>
              <span className="text-sm text-muted-foreground">
                Monthly Fee: ₹
                {(selectedGridBatch.monthlyFee ?? DEFAULT_MONTHLY_FEE).toLocaleString(
                  "en-IN",
                )}
              </span>
            </div>
          )}
          <BatchMonthFeeTable
            batchId={gridBatchId}
            rows={gridRows}
            month={gridMonth}
            fallbackExpectedFee={selectedGridBatch?.monthlyFee ?? DEFAULT_MONTHLY_FEE}
            isLoading={isGridLoading}
            onFeesUpdated={handleGridFeesUpdated}
            onRecordPayment={handleGridRecordPayment}
          />
        </>
      )}

      <PaymentDialog
        fee={paymentFee}
        studentName={paymentTarget?.studentName ?? ""}
        isSubmitting={isSubmitting}
        onOpenChange={(open) => {
          if (!open) setPaymentTarget(null);
        }}
        onSubmit={handleSubmitPayment}
      />
    </>
  );
}
