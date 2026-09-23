"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
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
import {
  getAttendanceMarkingData,
  saveAttendanceForBatch,
} from "@/server/attendance/actions";
import { toDateKey } from "@/lib/utils";
import type { AttendanceEntryInput, AttendanceStatus } from "@/types/attendance";
import type { Batch } from "@/types/batch";
import type { Student } from "@/types/student";

function todayKey() {
  return toDateKey(new Date());
}

interface MarkAttendancePageClientProps {
  batches: Batch[];
  initialBatchId: string;
  initialDate: string;
  initialStudents: Student[];
  initialStatuses: Record<string, AttendanceStatus>;
}

export default function MarkAttendancePageClient({
  batches,
  initialBatchId,
  initialDate,
  initialStudents,
  initialStatuses,
}: MarkAttendancePageClientProps) {
  const router = useRouter();

  const [batchId, setBatchId] = useState(initialBatchId);
  const [date, setDate] = useState(initialDate || todayKey());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingRoster, startRosterTransition] = useTransition();
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [statuses, setStatuses] = useState<Record<string, AttendanceStatus>>(
    initialStatuses,
  );

  // The server already fetched roster/statuses matching the initial
  // batch+date — skip the first effect run so we don't immediately re-fetch
  // the same data on mount, only on subsequent picker changes.
  const isFirstRun = useRef(true);

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }

    // When no batch is selected, the "select a batch" branch renders
    // instead — students/statuses stay whatever they were, unused.
    if (!batchId) return;

    let cancelled = false;

    startRosterTransition(async () => {
      const data = await getAttendanceMarkingData(batchId, date);
      if (cancelled) return;
      setStudents(data.students);
      setStatuses(data.initialStatuses);
    });

    return () => {
      cancelled = true;
    };
  }, [batchId, date]);

  async function handleSave(entries: AttendanceEntryInput[]) {
    if (!batchId) return;
    setIsSubmitting(true);
    await saveAttendanceForBatch(batchId, date, entries);
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

      <Card className="rounded-2xl border-border shadow-raised">
        <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-end sm:p-6">
          <div className="flex flex-1 flex-col gap-2">
            <Label htmlFor="mark-batch">Batch</Label>
            <Select value={batchId} onValueChange={setBatchId}>
              <SelectTrigger id="mark-batch" className="h-11 rounded-xl">
                <SelectValue placeholder="Select a batch" />
              </SelectTrigger>
              <SelectContent>
                {batches.map((batch) => (
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
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-card px-6 py-10 text-center">
          <p className="text-sm font-medium text-foreground">
            Select a batch to begin
          </p>
          <p className="max-w-xs text-sm text-muted-foreground">
            Choose a batch above to see its enrolled students.
          </p>
        </div>
      ) : isLoadingRoster ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-card px-6 py-10 text-center">
          <p className="text-sm text-muted-foreground">Loading students…</p>
        </div>
      ) : students.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-card px-6 py-10 text-center">
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
          initialStatuses={statuses}
          isSubmitting={isSubmitting}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}
    </PageContainer>
  );
}
