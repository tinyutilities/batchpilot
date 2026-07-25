"use client";

import { format } from "date-fns";
import { Eye, MoreHorizontal, Pencil, Trash2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import type { TestResultSummary } from "@/types/marks";

interface MarksTableProps {
  summaries: TestResultSummary[];
  isLoading?: boolean;
  onViewResults: (summary: TestResultSummary) => void;
  onEditTest: (summary: TestResultSummary) => void;
  onDeleteTest: (summary: TestResultSummary) => void;
}

function getScoreColor(percentage: number) {
  if (percentage >= 90) return "text-emerald-600 dark:text-emerald-400";
  if (percentage >= 75) return "text-blue-600 dark:text-blue-400";
  if (percentage >= 50) return "text-amber-600 dark:text-amber-400";
  return "text-red-600 dark:text-red-400";
}

function TableSkeleton() {
  return (
    <div className="flex flex-col">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="flex items-center gap-4 border-b border-slate-100 px-6 py-4 last:border-0 dark:border-slate-900"
        >
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-24" />
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
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
        <Users className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
      </div>
      <p className="text-sm font-medium text-foreground">
        No tests match your filters
      </p>
      <p className="max-w-xs text-sm text-muted-foreground">
        Try adjusting your search or filters.
      </p>
    </div>
  );
}

export default function MarksTable({
  summaries,
  isLoading = false,
  onViewResults,
  onEditTest,
  onDeleteTest,
}: MarksTableProps) {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <TableSkeleton />
      </div>
    );
  }

  if (summaries.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <EmptyState />
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Test</TableHead>
            <TableHead>Subject</TableHead>
            <TableHead>Batch</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Appeared</TableHead>
            <TableHead>Average</TableHead>
            <TableHead>Highest</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {summaries.map((summary) => (
            <TableRow
              key={summary.test.id}
              tabIndex={0}
              className="cursor-pointer focus:bg-muted/50 focus:outline-none"
              onClick={() => onViewResults(summary)}
              onKeyDown={(e) => {
                if (e.key === "Enter") onViewResults(summary);
              }}
            >
              <TableCell className="font-medium text-foreground">
                {summary.test.name}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {summary.test.subject}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {summary.batchName}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {format(new Date(summary.test.testDate), "d MMM yyyy")}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {summary.studentsAppeared}
              </TableCell>
              <TableCell>
                <span
                  className={cn(
                    "font-medium",
                    getScoreColor(summary.averagePercentage)
                  )}
                >
                  {summary.averagePercentage}%
                </span>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {summary.highestPercentage}%
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Actions for ${summary.test.name}`}
                      onClick={(e) => e.stopPropagation()}
                      className="text-muted-foreground"
                    >
                      <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <DropdownMenuItem onClick={() => onViewResults(summary)}>
                      <Eye className="mr-2 h-4 w-4" aria-hidden="true" />
                      View Results
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEditTest(summary)}>
                      <Pencil className="mr-2 h-4 w-4" aria-hidden="true" />
                      Edit Test
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDeleteTest(summary)}
                      className="text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400"
                    >
                      <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
