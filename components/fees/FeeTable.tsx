"use client";

import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ReceiptText, Wallet } from "lucide-react";
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
import PaymentStatusBadge from "@/components/fees/PaymentStatusBadge";
import { monthLabel } from "@/lib/calculations/fees";
import { cn } from "@/lib/utils";
import type { FeeTableRow } from "@/types/fees";

const stickyHeadClass =
  "sticky top-0 z-10 bg-card";

interface FeeTableProps {
  rows: FeeTableRow[];
  isLoading?: boolean;
  onViewStudent: (row: FeeTableRow) => void;
  onViewBatch: (row: FeeTableRow) => void;
  onRecordPayment: (row: FeeTableRow) => void;
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
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="flex items-center gap-4 border-b border-border px-6 py-4 last:border-0"
        >
          <Skeleton className="h-9 w-9 rounded-full" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="ml-auto h-9 w-28 rounded-xl" />
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-10 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <ReceiptText
          className="h-6 w-6 text-muted-foreground"
          aria-hidden="true"
        />
      </div>
      <p className="text-sm font-medium text-foreground">
        No fee records match your filters
      </p>
      <p className="max-w-xs text-sm text-muted-foreground">
        Try adjusting your search or filters.
      </p>
    </div>
  );
}

export default function FeeTable({
  rows,
  isLoading = false,
  onViewStudent,
  onViewBatch,
  onRecordPayment,
}: FeeTableProps) {
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card">
        <TableSkeleton />
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card">
        <EmptyState />
      </div>
    );
  }

  return (
    <div className="max-h-[65vh] overflow-auto rounded-xl border border-border bg-card">
      <table className="hidden w-full caption-bottom text-sm md:table">
        <TableHeader>
          <TableRow>
            <TableHead className={stickyHeadClass}>Student</TableHead>
            <TableHead className={stickyHeadClass}>Batch</TableHead>
            <TableHead className={stickyHeadClass}>Month</TableHead>
            <TableHead className={stickyHeadClass}>Amount</TableHead>
            <TableHead className={stickyHeadClass}>Paid</TableHead>
            <TableHead className={stickyHeadClass}>Balance</TableHead>
            <TableHead className={stickyHeadClass}>Due Date</TableHead>
            <TableHead className={stickyHeadClass}>Status</TableHead>
            <TableHead className={cn(stickyHeadClass, "text-right")}>
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => {
            const balance = row.fee.amount - row.fee.amountPaid;

            return (
              <TableRow key={row.fee.id}>
                <TableCell>
                  <button
                    type="button"
                    onClick={() => onViewStudent(row)}
                    onMouseEnter={() => router.prefetch(`/dashboard/students/${row.studentId}`)}
                    onFocus={() => router.prefetch(`/dashboard/students/${row.studentId}`)}
                    className="flex items-center gap-3 text-left hover:underline"
                  >
                    <Avatar className="h-9 w-9">
                      <AvatarFallback>
                        {getInitials(row.studentName)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-foreground">
                      {row.studentName}
                    </span>
                  </button>
                </TableCell>
                <TableCell>
                  <button
                    type="button"
                    onClick={() => onViewBatch(row)}
                    onMouseEnter={() => router.prefetch(`/dashboard/batches/${row.fee.batchId}`)}
                    onFocus={() => router.prefetch(`/dashboard/batches/${row.fee.batchId}`)}
                    className="text-foreground hover:underline"
                  >
                    {row.batchName}
                  </button>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {monthLabel(row.fee.month)}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  ₹{row.fee.amount.toLocaleString("en-IN")}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  ₹{row.fee.amountPaid.toLocaleString("en-IN")}
                </TableCell>
                <TableCell className="font-medium text-foreground">
                  ₹{balance.toLocaleString("en-IN")}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {format(new Date(row.fee.dueDate), "d MMM yyyy")}
                </TableCell>
                <TableCell>
                  <PaymentStatusBadge status={row.fee.status} />
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-1.5 rounded-xl"
                    disabled={row.fee.status === "paid"}
                    onClick={() => onRecordPayment(row)}
                  >
                    <Wallet className="h-3.5 w-3.5" aria-hidden="true" />
                    Record Payment
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </table>

      <div className="flex flex-col divide-y divide-border md:hidden">
        {rows.map((row) => {
          const balance = row.fee.amount - row.fee.amountPaid;

          return (
            <div key={row.fee.id} className="flex flex-col gap-3 p-4">
              <div className="flex items-start justify-between gap-3">
                <button
                  type="button"
                  onClick={() => onViewStudent(row)}
                  onMouseEnter={() => router.prefetch(`/dashboard/students/${row.studentId}`)}
                  onFocus={() => router.prefetch(`/dashboard/students/${row.studentId}`)}
                  className="flex items-center gap-3 text-left"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>{getInitials(row.studentName)}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="font-medium text-foreground">
                      {row.studentName}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewBatch(row);
                      }}
                      onMouseEnter={() => router.prefetch(`/dashboard/batches/${row.fee.batchId}`)}
                      onFocus={() => router.prefetch(`/dashboard/batches/${row.fee.batchId}`)}
                      className="text-left text-xs text-muted-foreground hover:underline"
                    >
                      {row.batchName} · {monthLabel(row.fee.month)}
                    </button>
                  </div>
                </button>
                <PaymentStatusBadge status={row.fee.status} />
              </div>

              <div className="grid grid-cols-3 gap-2 text-sm">
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">Amount</span>
                  <span className="text-foreground">
                    ₹{row.fee.amount.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">Paid</span>
                  <span className="text-foreground">
                    ₹{row.fee.amountPaid.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">Balance</span>
                  <span className="font-medium text-foreground">
                    ₹{balance.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3">
                <span className="text-xs text-muted-foreground">
                  Due {format(new Date(row.fee.dueDate), "d MMM yyyy")}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-9 gap-1.5 rounded-xl"
                  disabled={row.fee.status === "paid"}
                  onClick={() => onRecordPayment(row)}
                >
                  <Wallet className="h-3.5 w-3.5" aria-hidden="true" />
                  Record Payment
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
