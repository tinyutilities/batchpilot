"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Bug } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { EmptyState } from "@/components/layout/empty-state";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { mockBugReports, updateBugReportStatus } from "@/lib/mock/admin";
import type { BugReport, BugReportStatus } from "@/types/admin";

const STATUS_OPTIONS: { value: BugReportStatus; label: string }[] = [
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In Progress" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
];

const STATUS_BADGE_STYLES: Record<BugReportStatus, string> = {
  open: "bg-danger-soft text-destructive hover:bg-danger-soft",
  in_progress:
    "bg-warning-soft text-warning hover:bg-warning-soft",
  resolved:
    "bg-success-soft text-success hover:bg-success-soft",
  closed:
    "bg-muted text-muted-foreground hover:bg-muted",
};

export default function AdminBugReportsPage() {
  const [reports, setReports] = useState<BugReport[]>(mockBugReports);

  function handleStatusChange(report: BugReport, status: BugReportStatus) {
    const updated = updateBugReportStatus(report.id, status);
    if (!updated) return;
    setReports((prev) => prev.map((r) => (r.id === report.id ? updated : r)));
    toast.success(`"${report.title}" marked as ${status.replace("_", " ")}.`);
  }

  return (
    <PageContainer>
      <PageHeader
        title="Bug Reports"
        description="Issues submitted by teachers using BatchPilot."
      />

      {reports.length === 0 ? (
        <EmptyState
          icon={<Bug className="h-7 w-7" aria-hidden="true" />}
          title="No bug reports"
          description="Reports submitted by teachers will show up here."
        />
      ) : (
        <div className="flex flex-col gap-4">
          {reports.map((report) => (
            <DashboardCard
              key={report.id}
              title={report.title}
              description={`Submitted by ${report.submittedBy} · ${format(
                new Date(report.createdAt),
                "d MMM yyyy",
              )}`}
              action={
                <Select
                  value={report.status}
                  onValueChange={(value) =>
                    handleStatusChange(report, value as BugReportStatus)
                  }
                >
                  <SelectTrigger className="h-9 w-[150px] rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              }
            >
              <div className="flex flex-col gap-3">
                <p className="text-sm text-muted-foreground">
                  {report.description}
                </p>
                <div>
                  <Badge
                    className={`rounded-full border-transparent ${STATUS_BADGE_STYLES[report.status]}`}
                  >
                    {STATUS_OPTIONS.find((o) => o.value === report.status)
                      ?.label ?? report.status}
                  </Badge>
                </div>
              </div>
            </DashboardCard>
          ))}
        </div>
      )}
    </PageContainer>
  );
}
