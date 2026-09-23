"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
  CheckCircle2,
  History,
  MoreHorizontal,
  RotateCcw,
  Users,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { mutate as globalMutate } from "swr";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import PaymentStatusBadge from "@/components/fees/PaymentStatusBadge";
import { formatPaymentMethod, monthLabel } from "@/lib/calculations/fees";
import {
  fetchPaymentsForStudent,
  markAllPaidForBatchMonth,
  markFeePaidInFull,
  resetFeePayments,
} from "@/server/fees/actions";
import { DASHBOARD_STATS_KEY } from "@/lib/hooks/use-dashboard-stats";
import type { BatchFeeGridRow, FeeRecord, Payment } from "@/types/fees";

const stickyHeadClass = "sticky top-0 z-10 bg-card";

interface BatchMonthFeeTableProps {
  batchId: string;
  rows: BatchFeeGridRow[];
  month: string;
  // Shown as "Expected" for a student whose fee row hasn't been
  // materialized yet (e.g. auto-init hasn't finished on first paint).
  fallbackExpectedFee: number;
  isLoading?: boolean;
  // Patches the local grid from authoritative post-mutation FeeRecord(s)
  // instead of refetching — the caller applies these to its SWR cache.
  onFeesUpdated: (updates: { studentId: string; fee: FeeRecord }[]) => void;
  onRecordPayment: (studentId: string, studentName: string, month: string) => void;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function TableSkeleton() {
  return (
    <div className="flex flex-col">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="flex items-center gap-4 border-b border-border px-6 py-4 last:border-0"
        >
          <Skeleton className="h-9 w-9 rounded-full" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="ml-auto h-9 w-28 rounded-xl" />
        </div>
      ))}
    </div>
  );
}

export default function BatchMonthFeeTable({
  batchId,
  rows,
  month,
  fallbackExpectedFee,
  isLoading = false,
  onFeesUpdated,
  onRecordPayment,
}: BatchMonthFeeTableProps) {
  const [pendingStudentId, setPendingStudentId] = useState<string | null>(null);
  const [historyStudent, setHistoryStudent] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [historyPayments, setHistoryPayments] = useState<Payment[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [showMarkAllConfirm, setShowMarkAllConfirm] = useState(false);
  const [isMarkingAll, setIsMarkingAll] = useState(false);

  async function handleMarkPaid(studentId: string, studentName: string) {
    setPendingStudentId(studentId);
    const fee = await markFeePaidInFull(studentId, month);
    setPendingStudentId(null);
    if (fee) {
      toast.success(`${studentName} marked paid.`);
      onFeesUpdated([{ studentId, fee }]);
      globalMutate(DASHBOARD_STATS_KEY);
    } else {
      toast.error("Couldn't mark that fee as paid. Please try again.");
    }
  }

  async function handleMarkPending(
    feeId: string,
    studentId: string,
    studentName: string,
  ) {
    setPendingStudentId(studentId);
    const fee = await resetFeePayments(feeId);
    setPendingStudentId(null);
    if (fee) {
      toast.success(`${studentName}'s payment was reset to pending.`);
      onFeesUpdated([{ studentId, fee }]);
      globalMutate(DASHBOARD_STATS_KEY);
    } else {
      toast.error("Couldn't reset that payment. Please try again.");
    }
  }

  async function handleViewHistory(studentId: string, studentName: string) {
    setHistoryStudent({ id: studentId, name: studentName });
    setIsLoadingHistory(true);
    const payments = await fetchPaymentsForStudent(studentId);
    setHistoryPayments(payments);
    setIsLoadingHistory(false);
  }

  async function handleMarkAllPaid() {
    setIsMarkingAll(true);
    try {
      const { markedCount, updatedFees } = await markAllPaidForBatchMonth(batchId, month);
      if (markedCount > 0) {
        toast.success(
          `Marked ${markedCount} student${markedCount === 1 ? "" : "s"} paid for ${monthLabel(month)}.`,
        );
        onFeesUpdated(updatedFees);
        globalMutate(DASHBOARD_STATS_KEY);
      } else {
        toast.info("Nothing to mark — everyone is already settled.");
      }
    } catch {
      toast.error(
        "Couldn't mark everyone paid. Your existing records are unchanged — try again.",
      );
    } finally {
      setIsMarkingAll(false);
      setShowMarkAllConfirm(false);
    }
  }

  const outstandingCount = rows.filter((row) => {
    const status = row.cells.find((c) => c.month === month)?.status ?? "pending";
    return status === "pending" || status === "partial" || status === "overdue";
  }).length;

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card">
        <TableSkeleton />
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-border bg-card px-6 py-10 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <Users className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
        </div>
        <p className="text-sm font-medium text-foreground">
          No students in this batch yet
        </p>
        <p className="max-w-xs text-sm text-muted-foreground">
          Add students to this batch to start tracking their fees.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {outstandingCount > 0
            ? `${outstandingCount} student${outstandingCount === 1 ? "" : "s"} outstanding for ${monthLabel(month)}`
            : `Everyone is settled for ${monthLabel(month)}`}
        </p>
        {outstandingCount > 0 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5 rounded-xl"
            onClick={() => setShowMarkAllConfirm(true)}
          >
            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
            Mark All Paid
          </Button>
        )}
      </div>

      <div className="max-h-[65vh] overflow-auto rounded-xl border border-border bg-card">
        <table className="w-full caption-bottom text-sm">
          <TableHeader>
            <TableRow>
              <TableHead className={stickyHeadClass}>Student</TableHead>
              <TableHead className={stickyHeadClass}>Expected</TableHead>
              <TableHead className={stickyHeadClass}>Paid</TableHead>
              <TableHead className={stickyHeadClass}>Status</TableHead>
              <TableHead className={`${stickyHeadClass} text-right`}>
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => {
              const cell = row.cells.find((c) => c.month === month);
              const status = cell?.status ?? "pending";
              const expected = cell?.amount ?? fallbackExpectedFee;
              const paid = cell?.amountPaid ?? 0;
              const isBusy = pendingStudentId === row.studentId;

              return (
                <TableRow key={row.studentId}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 shrink-0">
                        <AvatarFallback>
                          {getInitials(row.studentName)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-foreground">
                        {row.studentName}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    ₹{expected.toLocaleString("en-IN")}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    ₹{paid.toLocaleString("en-IN")}
                  </TableCell>
                  <TableCell>
                    <PaymentStatusBadge status={status} />
                  </TableCell>
                  <TableCell className="text-right">
                    {status === "not_due" ? null : (
                      <div className="flex items-center justify-end gap-1.5">
                        {status === "paid" ? (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="gap-1.5 rounded-xl"
                            disabled={isBusy}
                            onClick={() =>
                              handleViewHistory(row.studentId, row.studentName)
                            }
                          >
                            <History className="h-3.5 w-3.5" aria-hidden="true" />
                            View History
                          </Button>
                        ) : status === "partial" ? (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="gap-1.5 rounded-xl"
                            disabled={isBusy}
                            onClick={() =>
                              onRecordPayment(row.studentId, row.studentName, month)
                            }
                          >
                            <Wallet className="h-3.5 w-3.5" aria-hidden="true" />
                            Record Payment
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            size="sm"
                            className="gap-1.5 rounded-xl"
                            disabled={isBusy}
                            onClick={() =>
                              handleMarkPaid(row.studentId, row.studentName)
                            }
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                            Mark Paid
                          </Button>
                        )}

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              disabled={isBusy}
                              aria-label={`More actions for ${row.studentName}`}
                              className="relative before:absolute before:-inset-2 before:content-['']"
                            >
                              <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {status !== "paid" && (
                              <DropdownMenuItem
                                onClick={() =>
                                  onRecordPayment(
                                    row.studentId,
                                    row.studentName,
                                    month,
                                  )
                                }
                              >
                                <Wallet className="mr-2 h-4 w-4" aria-hidden="true" />
                                Record Partial Payment...
                              </DropdownMenuItem>
                            )}
                            {status !== "pending" && status !== "overdue" && (
                              <DropdownMenuItem
                                onClick={() =>
                                  handleMarkPaid(row.studentId, row.studentName)
                                }
                              >
                                <CheckCircle2
                                  className="mr-2 h-4 w-4"
                                  aria-hidden="true"
                                />
                                Mark Paid in Full
                              </DropdownMenuItem>
                            )}
                            {(status === "partial" || status === "paid") &&
                              cell?.feeId && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleMarkPending(
                                      cell.feeId!,
                                      row.studentId,
                                      row.studentName,
                                    )
                                  }
                                >
                                  <RotateCcw
                                    className="mr-2 h-4 w-4"
                                    aria-hidden="true"
                                  />
                                  Mark Pending
                                </DropdownMenuItem>
                              )}
                            {status !== "paid" && (
                              <DropdownMenuItem
                                onClick={() =>
                                  handleViewHistory(row.studentId, row.studentName)
                                }
                              >
                                <History className="mr-2 h-4 w-4" aria-hidden="true" />
                                View History
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </table>
      </div>

      <Dialog
        open={historyStudent !== null}
        onOpenChange={(open) => {
          if (!open) setHistoryStudent(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Payment History</DialogTitle>
            <DialogDescription>{historyStudent?.name ?? ""}</DialogDescription>
          </DialogHeader>
          {isLoadingHistory ? (
            <div className="flex flex-col gap-2">
              <Skeleton className="h-10 w-full rounded-lg" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
          ) : historyPayments.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No payments recorded yet.
            </p>
          ) : (
            <div className="flex max-h-80 flex-col gap-3 overflow-auto">
              {historyPayments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between border-b border-border pb-2 text-sm last:border-0"
                >
                  <div className="flex flex-col">
                    <span className="font-medium text-foreground">
                      ₹{payment.amount.toLocaleString("en-IN")}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatPaymentMethod(payment.method)}
                      {payment.referenceNumber
                        ? ` · ${payment.referenceNumber}`
                        : ""}
                    </span>
                  </div>
                  <span className="text-muted-foreground">
                    {format(new Date(payment.date), "d MMM yyyy")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={showMarkAllConfirm} onOpenChange={setShowMarkAllConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mark everyone paid?</AlertDialogTitle>
            <AlertDialogDescription>
              This records a full cash payment for {outstandingCount} student
              {outstandingCount === 1 ? "" : "s"} for {monthLabel(month)}.
              Students who already have a partial payment will only be
              charged the remaining balance. This can&apos;t be undone in
              bulk — you&apos;d need to reset each student individually.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isMarkingAll}>Cancel</AlertDialogCancel>
            <AlertDialogAction disabled={isMarkingAll} onClick={handleMarkAllPaid}>
              {isMarkingAll ? "Marking…" : "Mark All Paid"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
