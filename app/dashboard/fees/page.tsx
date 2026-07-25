"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ReceiptText } from "lucide-react";
import { toast } from "sonner";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { ModuleAlertBanner } from "@/components/dashboard/ModuleAlertBanner";
import { cn } from "@/lib/utils";
import FeeStats from "@/components/fees/FeeStats";
import FeeFilters from "@/components/fees/FeeFilters";
import FeeTable from "@/components/fees/FeeTable";
import PaymentDialog from "@/components/fees/PaymentDialog";
import {
  computeFeeStats,
  getAllFees,
  getMonthlyCollectionStats,
  getOverdueFees,
  monthLabel,
  recordPayment,
} from "@/lib/mock/fees";
import { getBatchById, mockBatches } from "@/lib/mock/batch";
import { getStudentById, mockStudents } from "@/lib/mock/student";
import type { FeeRecord, FeeTableRow, PaymentInput } from "@/types/fees";

function currentMonthKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function getRateColor(percentage: number) {
  if (percentage >= 90) return "bg-emerald-500";
  if (percentage >= 70) return "bg-blue-500";
  if (percentage >= 40) return "bg-amber-500";
  return "bg-red-500";
}

export default function FeesPage() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [selectedSort, setSelectedSort] = useState("dueDate-desc");
  const [paymentTarget, setPaymentTarget] = useState<FeeTableRow | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 400);
    return () => clearTimeout(timer);
  }, []);

  const thisMonth = currentMonthKey();

  const stats = useMemo(() => {
    const currentMonthFees = getAllFees().filter((fee) => fee.month === thisMonth);
    return computeFeeStats(currentMonthFees);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [thisMonth, refreshKey]);

  const monthlyStats = useMemo(
    () => getMonthlyCollectionStats(3),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [refreshKey]
  );

  const overdueFees = useMemo(
    () => getOverdueFees(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [refreshKey]
  );

  const allRows: FeeTableRow[] = useMemo(() => {
    return getAllFees().map((fee) => {
      const student = getStudentById(fee.studentId);
      const batch = getBatchById(fee.batchId);
      return {
        fee,
        studentId: fee.studentId,
        studentName: student?.fullName ?? "Unknown Student",
        batchName: batch?.name ?? "Unknown Batch",
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  const months = useMemo(() => {
    return Array.from(new Set(allRows.map((row) => row.fee.month))).sort(
      (a, b) => (a < b ? 1 : -1)
    );
  }, [allRows]);

  const filteredRows = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    const filtered = allRows.filter((row) => {
      const matchesSearch =
        query.length === 0 ||
        row.studentName.toLowerCase().includes(query) ||
        row.batchName.toLowerCase().includes(query);
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
  }, [allRows, searchTerm, selectedBatch, selectedStatus, selectedMonth, selectedSort]);

  function handleResetFilters() {
    setSearchTerm("");
    setSelectedBatch("all");
    setSelectedStatus("all");
    setSelectedMonth("all");
    setSelectedSort("dueDate-desc");
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

  function handleSubmitPayment(input: PaymentInput) {
    if (!paymentTarget) return;
    setIsSubmitting(true);
    const payment = recordPayment(paymentTarget.fee.id, input);
    if (payment) {
      toast.success(
        `₹${input.amount.toLocaleString("en-IN")} recorded for ${
          paymentTarget.studentName
        }.`
      );
      setRefreshKey((key) => key + 1);
    }
    setPaymentTarget(null);
    setIsSubmitting(false);
  }

  const paymentFee: FeeRecord | null = paymentTarget
    ? getAllFees().find((fee) => fee.id === paymentTarget.fee.id) ?? null
    : null;

  return (
    <PageContainer>
      <PageHeader
        title="Fees"
        description="Track fee payments, pending dues, and payment history."
      />

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
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
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

      <FeeFilters
        searchTerm={searchTerm}
        selectedBatch={selectedBatch}
        selectedStatus={selectedStatus}
        selectedMonth={selectedMonth}
        selectedSort={selectedSort}
        batches={mockBatches}
        months={months}
        onSearchChange={setSearchTerm}
        onBatchChange={setSelectedBatch}
        onStatusChange={setSelectedStatus}
        onMonthChange={setSelectedMonth}
        onSortChange={setSelectedSort}
        onReset={handleResetFilters}
      />

      {!isLoading && allRows.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-6 py-10 text-center dark:border-slate-800 dark:bg-slate-950">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
            <ReceiptText
              className="h-6 w-6 text-muted-foreground"
              aria-hidden="true"
            />
          </div>
          <p className="text-sm font-medium text-foreground">
            No fee records yet
          </p>
          <p className="max-w-xs text-sm text-muted-foreground">
            {mockStudents.length === 0
              ? "Fee records are generated automatically once you have enrolled students."
              : "Fee records are generated automatically each month for enrolled students."}
          </p>
          {mockStudents.length === 0 && (
            <Button asChild className="mt-2 h-11 rounded-xl">
              <Link href="/dashboard/students/new">Add Student</Link>
            </Button>
          )}
        </div>
      ) : (
        <FeeTable
          rows={filteredRows}
          isLoading={isLoading}
          onViewStudent={handleViewStudent}
          onViewBatch={handleViewBatch}
          onRecordPayment={handleRecordPayment}
        />
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
    </PageContainer>
  );
}
