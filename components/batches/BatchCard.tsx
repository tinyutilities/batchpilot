"use client";

import {
  CalendarClock,
  Eye,
  MoreHorizontal,
  Pencil,
  Trash2,
  Users,
  Video,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { formatBatchSchedule } from "@/lib/mock/batch";
import type { Batch } from "@/types/batch";

interface BatchCardProps {
  batch: Batch;
  enrolledCount: number;
  onView: (batch: Batch) => void;
  onEdit: (batch: Batch) => void;
  onDelete: (batch: Batch) => void;
}

function getCapacityColor(percentage: number) {
  if (percentage >= 100) {
    return { text: "text-red-600 dark:text-red-400", bar: "bg-red-500" };
  }
  if (percentage >= 80) {
    return { text: "text-amber-600 dark:text-amber-400", bar: "bg-amber-500" };
  }
  return { text: "text-emerald-600 dark:text-emerald-400", bar: "bg-emerald-500" };
}

export default function BatchCard({
  batch,
  enrolledCount,
  onView,
  onEdit,
  onDelete,
}: BatchCardProps) {
  const capacityPercentage =
    batch.capacity > 0 ? Math.round((enrolledCount / batch.capacity) * 100) : 0;
  const { text, bar } = getCapacityColor(capacityPercentage);

  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={() => onView(batch)}
      onKeyDown={(e) => {
        if (e.key === "Enter") onView(batch);
      }}
      className="[--card-spacing:--spacing(5)] cursor-pointer rounded-2xl border-slate-200 shadow-sm transition-shadow hover:shadow-md dark:border-slate-800"
    >
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-foreground">{batch.name}</h3>
              {batch.status === "active" ? (
                <Badge className="rounded-full bg-emerald-50 text-emerald-600 hover:bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400">
                  Active
                </Badge>
              ) : (
                <Badge className="rounded-full bg-slate-100 text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-400">
                  Inactive
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {[batch.subject, batch.teacherName].filter(Boolean).join(" · ")}
            </p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={`Actions for ${batch.name}`}
                onClick={(e) => e.stopPropagation()}
                className="shrink-0 text-muted-foreground"
              >
                <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
              <DropdownMenuItem onClick={() => onView(batch)}>
                <Eye className="mr-2 h-4 w-4" aria-hidden="true" />
                View
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(batch)}>
                <Pencil className="mr-2 h-4 w-4" aria-hidden="true" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(batch)}
                className="text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400"
              >
                <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CalendarClock
            className="h-4 w-4 shrink-0 text-slate-400"
            aria-hidden="true"
          />
          {formatBatchSchedule(batch.schedule)}
        </div>

        {batch.googleMeetLink && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Video className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
            <span className="truncate">Google Meet linked</span>
          </div>
        )}

        {batch.capacity > 0 ? (
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Users className="h-4 w-4" aria-hidden="true" />
                {enrolledCount} / {batch.capacity} students
              </span>
              <span className={cn("font-medium", text)}>
                {capacityPercentage}%
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className={cn("h-full rounded-full", bar)}
                style={{ width: `${Math.min(capacityPercentage, 100)}%` }}
              />
            </div>
          </div>
        ) : (
          <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Users className="h-4 w-4" aria-hidden="true" />
            {enrolledCount} students · Unlimited capacity
          </span>
        )}
      </CardContent>
    </Card>
  );
}
