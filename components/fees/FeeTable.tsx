"use client";

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
  "sticky top-0 z-10 bg-white dark:bg-slate-950";

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
          className="flex items-center gap-4 border-b border-slate-100 px-6 py-4 last:border-0 dark:border-slate-900"
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
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
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
  if (isLoading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <TableSkeleton />
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <EmptyState />
      </div>
    );
  }

  return (
    <div className="max-h-[65vh] overflow-auto rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <table className="w-full caption-bottom text-sm">
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
    </div>
  );
}
