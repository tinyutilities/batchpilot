import Link from "next/link";
import { toast } from "sonner";
import {
  CalendarX2,
  CheckCircle2,
  Clock,
  Copy,
  MapPin,
  User,
  Video,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { cn } from "@/lib/utils";
import type { ScheduleEntry } from "@/types/dashboard";

async function handleCopyMeetLink(link: string) {
  try {
    await navigator.clipboard.writeText(link);
    toast.success("Meet link copied to clipboard.");
  } catch {
    toast.error("Couldn't copy the link.");
  }
}

function formatMeetLink(link: string) {
  return link.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

interface TodayScheduleProps {
  schedule: ScheduleEntry[];
  today: string;
}

export default function TodaySchedule({ schedule, today }: TodayScheduleProps) {
  return (
    <DashboardCard
      title="Today's Schedule"
      description="Your classes scheduled for today"
    >
      {schedule.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
          <CalendarX2
            className="h-8 w-8 text-muted-foreground"
            aria-hidden="true"
          />
          <p className="text-sm text-muted-foreground">
            No classes scheduled today.
          </p>
        </div>
      ) : (
        <div className="flex flex-col">
          {schedule.map((entry, index) => (
            <div key={entry.batchId}>
              <div className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-col gap-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium text-foreground">
                      {entry.batchName}
                    </p>
                    <Badge variant="secondary" className="rounded-full">
                      {entry.subject}
                    </Badge>
                    <Badge
                      className={cn(
                        "gap-1 rounded-full border-transparent",
                        entry.googleMeetLink
                          ? "bg-secondary-soft text-secondary-foreground hover:bg-secondary-soft"
                          : "bg-muted text-muted-foreground hover:bg-muted"
                      )}
                    >
                      {entry.googleMeetLink ? (
                        <Video className="h-3 w-3" aria-hidden="true" />
                      ) : (
                        <MapPin className="h-3 w-3" aria-hidden="true" />
                      )}
                      {entry.googleMeetLink ? "Online" : "In-Person"}
                    </Badge>
                    <Badge
                      className={cn(
                        "gap-1 rounded-full border-transparent",
                        entry.isMarked
                          ? "bg-success-soft text-success hover:bg-success-soft"
                          : "bg-warning-soft text-warning hover:bg-warning-soft"
                      )}
                    >
                      <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                      {entry.isMarked ? "Marked" : "Not marked"}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                      {entry.timeLabel}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="h-3.5 w-3.5" aria-hidden="true" />
                      {entry.teacherName}
                    </span>
                  </div>
                </div>

                <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
                  {entry.googleMeetLink && (
                    <>
                      <div className="flex items-center gap-1.5 rounded-lg border border-border bg-background py-1.5 pr-1.5 pl-2.5">
                        <span className="max-w-[160px] truncate font-mono text-xs text-foreground sm:max-w-[200px]">
                          {formatMeetLink(entry.googleMeetLink)}
                        </span>
                        <button
                          type="button"
                          aria-label="Copy Meet link"
                          onClick={() =>
                            handleCopyMeetLink(entry.googleMeetLink)
                          }
                          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        >
                          <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                          <span className="sr-only">Copy link</span>
                        </button>
                      </div>
                      <Button asChild variant="outline" size="sm">
                        <a
                          href={entry.googleMeetLink}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Video className="mr-1.5 h-3.5 w-3.5" />
                          Join Meeting
                        </a>
                      </Button>
                    </>
                  )}
                  <Button asChild size="sm">
                    <Link
                      href={`/dashboard/attendance/mark?batchId=${entry.batchId}&date=${today}`}
                    >
                      Mark Attendance
                    </Link>
                  </Button>
                </div>
              </div>
              {index < schedule.length - 1 && <Separator />}
            </div>
          ))}
        </div>
      )}
    </DashboardCard>
  );
}
