import { format } from "date-fns";
import { cn, toDateKey } from "@/lib/utils";
import type { AttendanceRecord, AttendanceStatus } from "@/types/attendance";

interface AttendanceCalendarProps {
  records: AttendanceRecord[];
  days?: number;
}

// Same semantic mapping as AttendanceStatusBadge — present/absent/late/
// excused should read identically everywhere attendance status appears.
const STATUS_COLOR: Record<AttendanceStatus, string> = {
  present: "bg-success",
  absent: "bg-destructive",
  late: "bg-warning",
  excused: "bg-secondary-foreground",
};

const LEGEND: { status: AttendanceStatus; label: string }[] = [
  { status: "present", label: "Present" },
  { status: "absent", label: "Absent" },
  { status: "late", label: "Late" },
  { status: "excused", label: "Excused" },
];

export default function AttendanceCalendar({
  records,
  days = 28,
}: AttendanceCalendarProps) {
  const recordsByDate = new Map(records.map((r) => [r.date, r]));
  const today = new Date();

  const cells = Array.from({ length: days }).map((_, index) => {
    const date = new Date(today);
    date.setDate(date.getDate() - (days - 1 - index));
    const dateKey = toDateKey(date);
    return { dateKey, record: recordsByDate.get(dateKey) };
  });

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-1.5">
        {cells.map((cell) => (
          <div
            key={cell.dateKey}
            title={`${format(new Date(cell.dateKey), "d MMM yyyy")}${
              cell.record ? ` — ${cell.record.status}` : " — no session"
            }`}
            className={cn(
              "h-4 w-4 rounded-sm",
              cell.record
                ? STATUS_COLOR[cell.record.status]
                : "bg-muted"
            )}
          />
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        {LEGEND.map((item) => (
          <span key={item.status} className="flex items-center gap-1.5">
            <span
              className={cn("h-2.5 w-2.5 rounded-sm", STATUS_COLOR[item.status])}
            />
            {item.label}
          </span>
        ))}
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-muted" />
          No session
        </span>
      </div>
    </div>
  );
}
