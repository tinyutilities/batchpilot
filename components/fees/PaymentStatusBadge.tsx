import {
  AlertTriangle,
  CheckCircle2,
  CircleDashed,
  Clock,
  MinusCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { FeeStatus } from "@/types/fees";

interface PaymentStatusBadgeProps {
  status: FeeStatus;
  className?: string;
}

// Mapped onto the coastal palette's semantic roles: paid → success
// (Periglacial Blue family), partial/pending → warning/accent (Clay
// family), overdue → danger (restrained red), not_due → neutral (Gallery).
const STATUS_CONFIG: Record<
  FeeStatus,
  { label: string; className: string; icon: typeof CheckCircle2 }
> = {
  paid: {
    label: "Paid",
    className: "bg-success-soft text-success hover:bg-success-soft",
    icon: CheckCircle2,
  },
  partial: {
    label: "Partial",
    className: "bg-warning-soft text-warning hover:bg-warning-soft",
    icon: Clock,
  },
  pending: {
    label: "Pending",
    className: "bg-accent-soft text-accent hover:bg-accent-soft",
    icon: CircleDashed,
  },
  overdue: {
    label: "Overdue",
    className: "bg-danger-soft text-destructive hover:bg-danger-soft",
    icon: AlertTriangle,
  },
  not_due: {
    label: "Not Due",
    className: "bg-muted text-muted-foreground hover:bg-muted",
    icon: MinusCircle,
  },
};

export default function PaymentStatusBadge({
  status,
  className,
}: PaymentStatusBadgeProps) {
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
