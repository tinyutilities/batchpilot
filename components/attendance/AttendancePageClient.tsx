"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CalendarCheck, ClipboardList, Plus } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { ModuleAlertBanner } from "@/components/dashboard/ModuleAlertBanner";
import AttendanceStats from "@/components/attendance/AttendanceStats";
import AttendanceFilters from "@/components/attendance/AttendanceFilters";
import AttendanceTable from "@/components/attendance/AttendanceTable";
import { toDateKey } from "@/lib/utils";
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
}

export default function AttendancePageClient({
  allSessions,
  stats,
  todaySummary,
  scheduledToday,
  todayMarkedBatchIds,
  batches,
}: AttendancePageClientProps) {
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedDate, setSelectedDate] = useState("");

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
    <PageContainer>
      <PageHeader
        title="Attendance"
        description="Mark and review student attendance across all batches."
        action={
          <Button asChild className="h-11 gap-2 rounded-xl">
            <Link href="/dashboard/attendance/mark">
              <Plus className="h-4 w-4" aria-hidden="true" />
              Mark Attendance
            </Link>
          </Button>
        }
      />

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
          <div className="flex flex-col divide-y divide-slate-100 dark:divide-slate-900">
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
                      <Badge className="rounded-full bg-emerald-50 text-emerald-600 hover:bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400">
                        Marked
                      </Badge>
                    ) : (
                      <Badge className="rounded-full bg-slate-100 text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-400">
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
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-6 py-10 text-center dark:border-slate-800 dark:bg-slate-950">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
            <ClipboardList
              className="h-6 w-6 text-muted-foreground"
              aria-hidden="true"
            />
          </div>
          <p className="text-sm font-medium text-foreground">
            No attendance has been recorded yet
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
    </PageContainer>
  );
}
