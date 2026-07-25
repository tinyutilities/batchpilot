"use client";

import { useState } from "react";
import { Eraser, UserX } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import GradeBadge from "@/components/marks/GradeBadge";
import { calculateGrade, calculatePercentage } from "@/lib/calculations/marks";
import { cn } from "@/lib/utils";
import type { MarkEntryInput, MarkStatus } from "@/types/marks";
import type { Student } from "@/types/student";

interface MarksEntryFormProps {
  students: Student[];
  maxMarks: number;
  initialMarks?: Record<string, { marksObtained: number; status: MarkStatus }>;
  onSave: (entries: MarkEntryInput[]) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

interface EntryState {
  marksObtained: number | null;
  status: MarkStatus;
}

function getInitials(firstName: string, lastName: string) {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export default function MarksEntryForm({
  students,
  maxMarks,
  initialMarks = {},
  onSave,
  onCancel,
  isSubmitting = false,
}: MarksEntryFormProps) {
  const [entries, setEntries] = useState<Record<string, EntryState>>(() => {
    const map: Record<string, EntryState> = {};
    students.forEach((student) => {
      const existing = initialMarks[student.id];
      map[student.id] = existing
        ? { marksObtained: existing.marksObtained, status: existing.status }
        : { marksObtained: null, status: "present" };
    });
    return map;
  });

  const unenteredCount = students.filter(
    (student) =>
      entries[student.id]?.status === "present" &&
      entries[student.id]?.marksObtained === null
  ).length;

  function updateMarks(studentId: string, value: number | null) {
    setEntries((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], marksObtained: value },
    }));
  }

  function toggleAbsent(studentId: string, absent: boolean) {
    setEntries((prev) => ({
      ...prev,
      [studentId]: {
        marksObtained: absent ? null : prev[studentId]?.marksObtained ?? null,
        status: absent ? "absent" : "present",
      },
    }));
  }

  function markAllAbsent() {
    setEntries(() => {
      const map: Record<string, EntryState> = {};
      students.forEach((student) => {
        map[student.id] = { marksObtained: null, status: "absent" };
      });
      return map;
    });
  }

  function clearMarks() {
    setEntries(() => {
      const map: Record<string, EntryState> = {};
      students.forEach((student) => {
        map[student.id] = { marksObtained: null, status: "present" };
      });
      return map;
    });
  }

  function handleSubmit() {
    if (unenteredCount > 0) return;

    const payload: MarkEntryInput[] = students.map((student) => {
      const entry = entries[student.id];
      return {
        studentId: student.id,
        marksObtained: entry.status === "absent" ? 0 : entry.marksObtained ?? 0,
        status: entry.status,
      };
    });
    onSave(payload);
  }

  return (
    <Card className="rounded-2xl border-slate-200 shadow-sm dark:border-slate-800">
      <CardContent className="flex flex-col gap-4 p-0">
        <div className="flex flex-col gap-3 border-b border-slate-100 px-6 py-4 dark:border-slate-900 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            {students.length} student{students.length === 1 ? "" : "s"} · Max
            marks {maxMarks}
            {unenteredCount > 0 && (
              <span className="ml-2 text-amber-600 dark:text-amber-400">
                · {unenteredCount} unentered
              </span>
            )}
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5 rounded-xl"
              onClick={markAllAbsent}
            >
              <UserX className="h-3.5 w-3.5" aria-hidden="true" />
              Mark all Absent
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5 rounded-xl"
              onClick={clearMarks}
            >
              <Eraser className="h-3.5 w-3.5" aria-hidden="true" />
              Clear Marks
            </Button>
          </div>
        </div>

        <div className="flex flex-col divide-y divide-slate-100 dark:divide-slate-900">
          {students.map((student) => {
            const entry = entries[student.id];
            const isAbsent = entry.status === "absent";
            const percentage =
              !isAbsent && entry.marksObtained !== null
                ? calculatePercentage(entry.marksObtained, maxMarks)
                : null;

            return (
              <div
                key={student.id}
                className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback>
                      {getInitials(student.firstName, student.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-foreground">
                      {student.fullName}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {student.batchName}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Input
                    type="number"
                    min={0}
                    max={maxMarks}
                    value={entry.marksObtained ?? ""}
                    disabled={isAbsent}
                    placeholder="—"
                    onChange={(e) => {
                      const raw = e.target.value;
                      updateMarks(
                        student.id,
                        raw === "" ? null : Number(raw)
                      );
                    }}
                    className={cn("h-10 w-24 rounded-xl", isAbsent && "opacity-50")}
                  />
                  {percentage !== null ? (
                    <GradeBadge grade={calculateGrade(percentage)} />
                  ) : (
                    <span className="w-14 text-center text-xs text-muted-foreground">
                      {isAbsent ? "—" : ""}
                    </span>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className={cn(
                      "rounded-xl",
                      isAbsent &&
                        "border-red-500 bg-red-500 text-white hover:bg-red-500"
                    )}
                    onClick={() => toggleAbsent(student.id, !isAbsent)}
                  >
                    Absent
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="sticky bottom-0 flex flex-col-reverse gap-3 border-t border-slate-100 bg-white px-6 py-4 dark:border-slate-900 dark:bg-slate-950 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            className="h-11 rounded-xl sm:w-auto"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="h-11 rounded-xl sm:w-auto"
            onClick={handleSubmit}
            disabled={isSubmitting || unenteredCount > 0}
          >
            Save Marks
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
