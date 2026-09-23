import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModuleAlertBannerProps {
  title: string;
  description?: string;
  severity?: "warning" | "critical";
  className?: string;
}

// A single, inline notice for surfacing something that needs attention
// directly inside the module it belongs to (Fees, Attendance, Marks,
// Batches) — replaces the dashboard's old dedicated Alerts column.
export function ModuleAlertBanner({
  title,
  description,
  severity = "warning",
  className,
}: ModuleAlertBannerProps) {
  return (
    <div
      role="alert"
      className={cn(
        "flex items-start gap-3 rounded-xl border px-4 py-3",
        severity === "critical"
          ? "border-destructive/25 bg-danger-soft/60"
          : "border-warning/25 bg-warning-soft/60",
        className,
      )}
    >
      <AlertTriangle
        className={cn(
          "mt-0.5 h-4 w-4 shrink-0",
          severity === "critical" ? "text-destructive" : "text-warning",
        )}
        aria-hidden="true"
      />
      <div className="flex flex-col gap-0.5">
        <p className="text-sm font-medium text-foreground">{title}</p>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  );
}
