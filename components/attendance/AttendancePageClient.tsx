"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CalendarCheck, ClipboardList, Download } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { ModuleAlertBanner } from "@/components/dashboard/ModuleAlertBanner";
import AttendanceStats from "@/components/attendance/AttendanceStats";
import AttendanceFilters from "@/components/attendance/AttendanceFilters";
import AttendanceTable from "@/components/attendance/AttendanceTable";
import { toDateKey } from "@/lib/utils";
import { downloadCsv, toCsv } from "@/lib/csv";
import type {
  AttendanceStatsData,
  BatchAttendanceSession,
  TodayAttendanceSummary,
} from "@/types/attendance";
import type { Batch } from "@/types/batch";

function todayKey() {
  return toDateKey(new Date());
}

function addDays(dateKey: string, amount: number) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + amount);
  return toDateKey(date);
}

interface AttendancePageClientProps {
  allSessions: BatchAttendanceSession[];
  stats: AttendanceStatsData;
  todaySummary: TodayAttendanceSummary;
  scheduledToday: Batch[];
  todayMarkedBatchIds: string[];
  batches: Batch[];
  studentNameById: Record<string, string>;
}

export default function AttendancePageClient({
  allSessions,
  stats,
  todaySummary,
  scheduledToday,
  todayMarkedBatchIds,
  batches,
  studentNameById,
}: AttendancePageClientProps) {
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedDate, setSelectedDate] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  const today = todayKey();
  const markedTodaySet = useMemo(
    () => new Set(todayMarkedBatchIds),
    [todayMarkedBatchIds],
  );
  const unmarkedToday = useMemo(
    () => scheduledToday.filter((batch) => !markedTodaySet.has(batch.id)),
    [scheduledToday, markedTodaySet],
  );

  const filteredSessions = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return allSessions.filter((session) => {
      const matchesSearch =
        query.length === 0 || session.batchName.toLowerCase().includes(query);
      const matchesBatch =
        selectedBatch === "all" || session.batchId === selectedBatch;
      const matchesDate = !selectedDate || session.date === selectedDate;
      const matchesStatus =
        selectedStatus === "all" ||
        session.records.some((record) => record.status === selectedStatus);

      return matchesSearch && matchesBatch && matchesDate && matchesStatus;
    });
  }, [allSessions, searchTerm, selectedBatch, selectedStatus, selectedDate]);

  // Exports one row per student attendance record across the currently
  // filtered sessions — matches what AttendanceTable shows below: the
  // status filter keeps a whole session if any record in it matches, so
  // (like the table) this exports every record in a matching session, not
  // just the records that individually match the status filter.
  function handleExportAttendance() {
    setIsExporting(true);
    try {
      const exportRows = filteredSessions.flatMap((session) =>
        session.records.map((record) => ({
          studentName: studentNameById[record.studentId] ?? "Unknown",
          batchName: session.batchName,
          date: record.date,
          status: record.status,
          markedAt: record.markedAt,
        })),
      );
      const csv = toCsv(exportRows, [
        { header: "Student", value: (r) => r.studentName },
        { header: "Batch", value: (r) => r.batchName },
        { header: "Date", value: (r) => r.date },
        { header: "Status", value: (r) => r.status },
        {
          header: "Marked At",
          value: (r) => new Date(r.markedAt).toISOString(),
        },
      ]);
      downloadCsv(`batchpilot-attendance-${toDateKey(new Date())}.csv`, csv);
      toast.success(
        `Exported ${exportRows.length} attendance record${exportRows.length === 1 ? "" : "s"}.`,
      );
    } catch {
      toast.error("Couldn't generate the export. Please try again.");
    } finally {
      setIsExporting(false);
    }
  }

  function handleResetFilters() {
    setSearchTerm("");
    setSelectedBatch("all");
    setSelectedStatus("all");
    setSelectedDate("");
  }

  function handleViewSession(session: BatchAttendanceSession) {
    router.push(
      `/dashboard/attendance/mark?batchId=${session.batchId}&date=${session.date}`
    );
  }

  function handleViewBatch(session: BatchAttendanceSession) {
    router.push(`/dashboard/batches/${session.batchId}`);
  }

  return (
    <>
      {unmarkedToday.length > 0 && (
        <ModuleAlertBanner
          title={`${unmarkedToday.length} batch${unmarkedToday.length === 1 ? "" : "es"} without attendance marked today`}
          description={unmarkedToday.map((batch) => batch.name).join(", ")}
        />
      )}

      {allSessions.length > 0 && <AttendanceStats stats={stats} />}

      <DashboardCard
        title="Today's Overview"
        description={`${todaySummary.batchesMarkedToday} of ${todaySummary.totalBatchesScheduledToday} scheduled batches marked`}
      >
        {scheduledToday.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
            <CalendarCheck
              className="h-6 w-6 text-muted-foreground"
              aria-hidden="true"
            />
            <p className="text-sm text-muted-foreground">
              No batches are scheduled for today.
            </p>
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-border">
            {scheduledToday.map((batch) => {
              const marked = markedTodaySet.has(batch.id);
              return (
                <div
                  key={batch.id}
                  className="flex items-center justify-between gap-3 py-3"
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-foreground">
                      {batch.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {batch.subject}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {marked ? (
                      <Badge className="rounded-full bg-success-soft text-success hover:bg-success-soft">
                        Marked
                      </Badge>
                    ) : (
                      <Badge className="rounded-full bg-muted text-muted-foreground hover:bg-muted">
                        Pending
                      </Badge>
                    )}
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="rounded-xl"
                    >
                      <Link
                        href={`/dashboard/attendance/mark?batchId=${batch.id}&date=${today}`}
                      >
                        {marked ? "Edit" : "Mark Now"}
                      </Link>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </DashboardCard>

      <div className="flex justify-end">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-1.5 rounded-xl"
          disabled={isExporting || filteredSessions.length === 0}
          onClick={handleExportAttendance}
        >
          <Download className="h-3.5 w-3.5" aria-hidden="true" />
          {isExporting ? "Exporting…" : "Export CSV"}
        </Button>
      </div>

      <AttendanceFilters
        searchTerm={searchTerm}
        selectedBatch={selectedBatch}
        selectedStatus={selectedStatus}
        selectedDate={selectedDate}
        batches={batches}
        onSearchChange={setSearchTerm}
        onBatchChange={setSelectedBatch}
        onStatusChange={setSelectedStatus}
        onDateChange={setSelectedDate}
        onReset={handleResetFilters}
        onDatePrev={() =>
          setSelectedDate((prev) => addDays(prev || today, -1))
        }
        onDateNext={() =>
          setSelectedDate((prev) => addDays(prev || today, 1))
        }
      />

      {filteredSessions.length === 0 && allSessions.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-border bg-card px-6 py-10 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <ClipboardList
              className="h-6 w-6 text-muted-foreground"
              aria-hidden="true"
            />
          </div>
          <p className="text-sm font-medium text-foreground">
            No attendance records yet.
          </p>
          <p className="max-w-xs text-sm text-muted-foreground">
            Mark attendance for a batch to start building attendance history.
          </p>
          <Button asChild className="mt-2 h-11 rounded-xl">
            <Link href="/dashboard/attendance/mark">Mark Attendance</Link>
          </Button>
        </div>
      ) : (
        <AttendanceTable
          sessions={filteredSessions}
          isLoading={false}
          onViewSession={handleViewSession}
          onViewBatch={handleViewBatch}
        />
      )}
    </>
  );
}
