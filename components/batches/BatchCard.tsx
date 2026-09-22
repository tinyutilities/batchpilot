"use client";

import { useRouter } from "next/navigation";
import {
  Archive,
  ArchiveRestore,
  CalendarClock,
  Eye,
  IndianRupee,
  MoreHorizontal,
  Pencil,
  Trash2,
  UserPlus,
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
import { formatBatchSchedule } from "@/lib/calculations/batch";
import type { Batch } from "@/types/batch";

interface BatchCardProps {
  batch: Batch;
  enrolledCount: number;
  onView: (batch: Batch) => void;
  onEdit: (batch: Batch) => void;
  onDelete: (batch: Batch) => void;
  onAddStudent: (batch: Batch) => void;
  onArchive: (batch: Batch) => void;
  onUnarchive: (batch: Batch) => void;
}

function getCapacityColor(percentage: number) {
  if (percentage >= 100) {
    return { text: "text-destructive", bar: "bg-destructive" };
  }
  if (percentage >= 80) {
    return { text: "text-warning", bar: "bg-warning" };
  }
  return { text: "text-success", bar: "bg-success" };
}

export default function BatchCard({
  batch,
  enrolledCount,
  onView,
  onEdit,
  onDelete,
  onAddStudent,
  onArchive,
  onUnarchive,
}: BatchCardProps) {
  const router = useRouter();
  const href = `/dashboard/batches/${batch.id}`;
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
      // Warms the batch detail route's navigation the moment intent is
      // shown, since this row isn't a real <Link> (it can't be — it
      // contains a nested dropdown-menu button, and nesting interactive
      // controls inside an <a> is invalid HTML). router.prefetch() is
      // Next.js's documented pattern for exactly this case.
      onMouseEnter={() => router.prefetch(href)}
      onFocus={() => router.prefetch(href)}
      className="[--card-spacing:--spacing(5)] cursor-pointer rounded-2xl border-border shadow-raised transition-shadow hover:shadow-elevated"
    >
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-foreground">{batch.name}</h3>
              {batch.status === "active" ? (
                <Badge className="rounded-full bg-success-soft text-success hover:bg-success-soft">
                  Active
                </Badge>
              ) : batch.status === "archived" ? (
                <Badge className="rounded-full bg-muted text-muted-foreground hover:bg-muted">
                  Archived
                </Badge>
              ) : (
                <Badge className="rounded-full bg-muted text-muted-foreground hover:bg-muted">
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
                className="relative shrink-0 text-muted-foreground before:absolute before:-inset-2 before:content-['']"
              >
                <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
              <DropdownMenuItem onClick={() => onView(batch)}>
                <Eye className="mr-2 h-4 w-4" aria-hidden="true" />
                View
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAddStudent(batch)}>
                <UserPlus className="mr-2 h-4 w-4" aria-hidden="true" />
                Add Student
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(batch)}>
                <Pencil className="mr-2 h-4 w-4" aria-hidden="true" />
                Edit
              </DropdownMenuItem>
              {batch.status === "archived" ? (
                <DropdownMenuItem onClick={() => onUnarchive(batch)}>
                  <ArchiveRestore className="mr-2 h-4 w-4" aria-hidden="true" />
                  Unarchive
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={() => onArchive(batch)}>
                  <Archive className="mr-2 h-4 w-4" aria-hidden="true" />
                  Archive
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={() => onDelete(batch)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CalendarClock
            className="h-4 w-4 shrink-0 text-muted-foreground"
            aria-hidden="true"
          />
          {formatBatchSchedule(batch.schedule)}
        </div>

        {batch.monthlyFee != null && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <IndianRupee
              className="h-4 w-4 shrink-0 text-muted-foreground"
              aria-hidden="true"
            />
            {`₹${batch.monthlyFee.toLocaleString("en-IN")}/month`}
          </div>
        )}

        {batch.googleMeetLink && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Video className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
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
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
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
