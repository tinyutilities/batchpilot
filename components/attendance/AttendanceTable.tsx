"use client";

import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { CalendarX2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { BatchAttendanceSession } from "@/types/attendance";

interface AttendanceTableProps {
  sessions: BatchAttendanceSession[];
  isLoading?: boolean;
  onViewSession: (session: BatchAttendanceSession) => void;
  onViewBatch: (session: BatchAttendanceSession) => void;
}

function getRateColor(percentage: number) {
  if (percentage >= 90) return "text-success";
  if (percentage >= 75) return "text-secondary-foreground";
  if (percentage >= 50) return "text-warning";
  return "text-destructive";
}

function TableSkeleton() {
  return (
    <div className="flex flex-col">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="flex items-center gap-4 border-b border-border px-6 py-4 last:border-0"
        >
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="ml-auto h-9 w-9 rounded-lg" />
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-10 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <CalendarX2
          className="h-6 w-6 text-muted-foreground"
          aria-hidden="true"
        />
      </div>
      <p className="text-sm font-medium text-foreground">
        No sessions match your filters
      </p>
      <p className="max-w-xs text-sm text-muted-foreground">
        Try adjusting your search or filters.
      </p>
    </div>
  );
}

export default function AttendanceTable({
  sessions,
  isLoading = false,
  onViewSession,
  onViewBatch,
}: AttendanceTableProps) {
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card">
        <TableSkeleton />
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card">
        <EmptyState />
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="hidden md:block">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Batch</TableHead>
            <TableHead>Present</TableHead>
            <TableHead>Absent</TableHead>
            <TableHead>Late</TableHead>
            <TableHead>Excused</TableHead>
            <TableHead>Rate</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sessions.map((session) => {
            const rate =
              session.totalStudents > 0
                ? Math.round(
                    ((session.presentCount + session.lateCount) /
                      session.totalStudents) *
                      100
                  )
                : 0;

            return (
              <TableRow
                key={`${session.batchId}-${session.date}`}
                tabIndex={0}
                className="cursor-pointer focus:bg-muted/50 focus:outline-none"
                onClick={() => onViewSession(session)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") onViewSession(session);
                }}
                onMouseEnter={() =>
                  router.prefetch(
                    `/dashboard/attendance/mark?batchId=${session.batchId}&date=${session.date}`,
                  )
                }
                onFocus={() =>
                  router.prefetch(
                    `/dashboard/attendance/mark?batchId=${session.batchId}&date=${session.date}`,
                  )
                }
              >
                <TableCell className="font-medium text-foreground">
                  {format(new Date(session.date), "d MMM yyyy")}
                </TableCell>
                <TableCell>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewBatch(session);
                    }}
                    onMouseEnter={() => router.prefetch(`/dashboard/batches/${session.batchId}`)}
                    onFocus={() => router.prefetch(`/dashboard/batches/${session.batchId}`)}
                    className="text-foreground hover:underline"
                  >
                    {session.batchName}
                  </button>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {session.presentCount}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {session.absentCount}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {session.lateCount}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {session.excusedCount}
                </TableCell>
                <TableCell>
                  <span className={cn("font-medium", getRateColor(rate))}>
                    {rate}%
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`View ${session.batchName} attendance on ${session.date}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewSession(session);
                    }}
                    className="relative before:absolute before:-inset-2 before:content-['']"
                  >
                    <Eye
                      className="h-4 w-4 text-muted-foreground"
                      aria-hidden="true"
                    />
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      </div>

      <div className="flex flex-col divide-y divide-border md:hidden">
        {sessions.map((session) => {
          const rate =
            session.totalStudents > 0
              ? Math.round(
                  ((session.presentCount + session.lateCount) /
                    session.totalStudents) *
                    100
                )
              : 0;

          return (
            <div
              key={`${session.batchId}-${session.date}`}
              role="button"
              tabIndex={0}
              onClick={() => onViewSession(session)}
              onKeyDown={(e) => {
                if (e.key === "Enter") onViewSession(session);
              }}
              onMouseEnter={() =>
                router.prefetch(
                  `/dashboard/attendance/mark?batchId=${session.batchId}&date=${session.date}`,
                )
              }
              onFocus={() =>
                router.prefetch(
                  `/dashboard/attendance/mark?batchId=${session.batchId}&date=${session.date}`,
                )
              }
              className="flex flex-col gap-2 p-4 transition-colors hover:bg-muted/40 focus:bg-muted/40 focus:outline-none"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-col">
                  <span className="font-medium text-foreground">
                    {format(new Date(session.date), "d MMM yyyy")}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewBatch(session);
                    }}
                    onMouseEnter={() => router.prefetch(`/dashboard/batches/${session.batchId}`)}
                    onFocus={() => router.prefetch(`/dashboard/batches/${session.batchId}`)}
                    className="text-left text-xs text-muted-foreground hover:underline"
                  >
                    {session.batchName}
                  </button>
                </div>
                <span className={cn("text-sm font-medium", getRateColor(rate))}>
                  {rate}%
                </span>
              </div>

              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span>{session.presentCount} present</span>
                <span>{session.absentCount} absent</span>
                <span>{session.lateCount} late</span>
                <span>{session.excusedCount} excused</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
