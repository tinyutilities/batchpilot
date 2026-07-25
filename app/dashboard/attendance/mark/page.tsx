"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AttendanceForm from "@/components/attendance/AttendanceForm";
import { getStudentsByBatch, mockBatches } from "@/lib/mock/batch";
import {
  getAttendanceForBatchOnDate,
  saveAttendanceForBatch,
  toDateKey,
} from "@/lib/mock/attendance";
import type { AttendanceEntryInput, AttendanceStatus } from "@/types/attendance";

function todayKey() {
  return toDateKey(new Date());
}

function MarkAttendanceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [batchId, setBatchId] = useState(searchParams.get("batchId") ?? "");
  const [date, setDate] = useState(searchParams.get("date") ?? todayKey());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const students = useMemo(
    () => (batchId ? getStudentsByBatch(batchId) : []),
    [batchId]
  );

  const initialStatuses = useMemo(() => {
    if (!batchId) return {};
    const records = getAttendanceForBatchOnDate(batchId, date);
    const map: Record<string, AttendanceStatus> = {};
    records.forEach((record) => {
      map[record.studentId] = record.status;
    });
    return map;
  }, [batchId, date]);

  function handleSave(entries: AttendanceEntryInput[]) {
    if (!batchId) return;
    setIsSubmitting(true);
    saveAttendanceForBatch(batchId, date, entries);
    toast.success(
      `Attendance saved for ${entries.length} student${
        entries.length === 1 ? "" : "s"
      }.`
    );
    router.push("/dashboard/attendance");
  }

  function handleCancel() {
    router.push("/dashboard/attendance");
  }

  return (
    <PageContainer className="gap-6">
      <div>
        <Button variant="ghost" size="sm" asChild className="-ml-2 mb-2">
          <Link href="/dashboard/attendance">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Attendance
          </Link>
        </Button>
        <PageHeader
          title="Mark Attendance"
          description="Select a batch and date, then mark every student."
        />
      </div>

      <Card className="[--card-spacing:--spacing(5)] rounded-2xl border-slate-200 shadow-sm sm:[--card-spacing:--spacing(6)] dark:border-slate-800">
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex flex-1 flex-col gap-2">
            <Label htmlFor="mark-batch">Batch</Label>
            <Select value={batchId} onValueChange={setBatchId}>
              <SelectTrigger id="mark-batch" className="h-11 rounded-xl">
                <SelectValue placeholder="Select a batch" />
              </SelectTrigger>
              <SelectContent>
                {mockBatches.map((batch) => (
                  <SelectItem key={batch.id} value={batch.id}>
                    {batch.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-1 flex-col gap-2 sm:max-w-[200px]">
            <Label htmlFor="mark-date">Date</Label>
            <Input
              id="mark-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="h-11 rounded-xl"
            />
          </div>
        </CardContent>
      </Card>

      {!batchId ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-6 py-10 text-center dark:border-slate-800 dark:bg-slate-950">
          <p className="text-sm font-medium text-foreground">
            Select a batch to begin
          </p>
          <p className="max-w-xs text-sm text-muted-foreground">
            Choose a batch above to see its enrolled students.
          </p>
        </div>
      ) : students.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-6 py-10 text-center dark:border-slate-800 dark:bg-slate-950">
          <p className="text-sm font-medium text-foreground">
            No students enrolled
          </p>
          <p className="max-w-xs text-sm text-muted-foreground">
            This batch has no students yet.{" "}
            <Link
              href={`/dashboard/batches/${batchId}`}
              className="underline"
            >
              Add students
            </Link>{" "}
            before marking attendance.
          </p>
        </div>
      ) : (
        <AttendanceForm
          key={`${batchId}-${date}`}
          students={students}
          initialStatuses={initialStatuses}
          isSubmitting={isSubmitting}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}
    </PageContainer>
  );
}

export default function MarkAttendancePage() {
  return (
    <Suspense fallback={null}>
      <MarkAttendanceContent />
    </Suspense>
  );
}
