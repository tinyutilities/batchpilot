import { CheckCircle2, Clock, ShieldCheck, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { AttendanceStatus } from "@/types/attendance";

interface AttendanceStatusBadgeProps {
  status: AttendanceStatus;
  className?: string;
}

// present → success (Periglacial Blue family), late → warning (Clay),
// excused → secondary (El Niño, informational rather than good/bad),
// absent → danger.
const STATUS_CONFIG: Record<
  AttendanceStatus,
  { label: string; className: string; icon: typeof CheckCircle2 }
> = {
  present: {
    label: "Present",
    className: "bg-success-soft text-success hover:bg-success-soft",
    icon: CheckCircle2,
  },
  absent: {
    label: "Absent",
    className: "bg-danger-soft text-destructive hover:bg-danger-soft",
    icon: XCircle,
  },
  late: {
    label: "Late",
    className: "bg-warning-soft text-warning hover:bg-warning-soft",
    icon: Clock,
  },
  excused: {
    label: "Excused",
    className: "bg-secondary-soft text-secondary-foreground hover:bg-secondary-soft",
    icon: ShieldCheck,
  },
};

export default function AttendanceStatusBadge({
  status,
  className,
}: AttendanceStatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;

  return (
    <Badge
      className={cn(
        "gap-1 rounded-full border-transparent",
        config.className,
        className
      )}
    >
      <Icon className="h-3 w-3" aria-hidden="true" />
      {config.label}
    </Badge>
  );
}
