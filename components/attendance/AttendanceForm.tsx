"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCheck, Eraser, XOctagon } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { AttendanceEntryInput, AttendanceStatus } from "@/types/attendance";
import type { Student } from "@/types/student";

interface AttendanceFormProps {
  students: Student[];
  initialStatuses?: Record<string, AttendanceStatus>;
  onSave: (entries: AttendanceEntryInput[]) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const STATUS_OPTIONS: {
  value: AttendanceStatus;
  label: string;
  activeClass: string;
}[] = [
  {
    value: "present",
    label: "Present",
    activeClass:
      "border-success bg-success text-white hover:bg-success",
  },
  {
    value: "absent",
    label: "Absent",
    activeClass: "border-destructive bg-destructive text-white hover:bg-destructive",
  },
  {
    value: "late",
    label: "Late",
    activeClass: "border-warning bg-warning text-white hover:bg-warning",
  },
  {
    value: "excused",
    label: "Excused",
    activeClass: "border-secondary-foreground bg-secondary-foreground text-white hover:bg-secondary-foreground",
  },
];

function getInitials(firstName: string, lastName: string) {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export default function AttendanceForm({
  students,
  initialStatuses = {},
  onSave,
  onCancel,
  isSubmitting = false,
}: AttendanceFormProps) {
  const [statuses, setStatuses] = useState<
    Record<string, AttendanceStatus | undefined>
  >(() => {
    const map: Record<string, AttendanceStatus | undefined> = {};
    students.forEach((student) => {
      map[student.id] = initialStatuses[student.id] ?? "present";
    });
    return map;
  });

  const unmarkedCount = students.filter((s) => !statuses[s.id]).length;

  function setStatus(studentId: string, status: AttendanceStatus) {
    setStatuses((prev) => ({ ...prev, [studentId]: status }));
  }

  function markAll(status: AttendanceStatus) {
    setStatuses(() => {
      const map: Record<string, AttendanceStatus | undefined> = {};
      students.forEach((student) => {
        map[student.id] = status;
      });
      return map;
    });
  }

  function clearAll() {
    setStatuses(() => {
      const map: Record<string, AttendanceStatus | undefined> = {};
      students.forEach((student) => {
        map[student.id] = undefined;
      });
      return map;
    });
  }

  function handleSubmit() {
    if (unmarkedCount > 0) return;

    const entries: AttendanceEntryInput[] = students.map((student) => ({
      studentId: student.id,
      status: statuses[student.id] as AttendanceStatus,
    }));
    onSave(entries);
  }

  return (
    <Card className="rounded-2xl border-border shadow-raised">
      <CardContent className="flex flex-col gap-4 p-0">
        <div className="flex flex-col gap-3 border-b border-border px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            {students.length} student{students.length === 1 ? "" : "s"}
            {unmarkedCount > 0 && (
              <span className="ml-2 text-warning">
                · {unmarkedCount} unmarked
              </span>
            )}
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5 rounded-xl"
              onClick={() => markAll("present")}
            >
              <CheckCheck className="h-3.5 w-3.5" aria-hidden="true" />
              Mark all Present
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5 rounded-xl"
              onClick={() => markAll("absent")}
            >
              <XOctagon className="h-3.5 w-3.5" aria-hidden="true" />
              Mark all Absent
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5 rounded-xl"
              onClick={clearAll}
            >
              <Eraser className="h-3.5 w-3.5" aria-hidden="true" />
              Clear Selections
            </Button>
          </div>
        </div>

        <div className="flex flex-col divide-y divide-border">
          {students.map((student) => {
            const currentStatus = statuses[student.id];

            return (
              <div
                key={student.id}
                className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <Link
                  href={`/dashboard/students/${student.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 hover:underline"
                >
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
                </Link>

                <div className="flex flex-wrap gap-2">
                  {STATUS_OPTIONS.map((option) => (
                    <Button
                      key={option.value}
                      type="button"
                      variant="outline"
                      size="sm"
                      className={cn(
                        "rounded-xl",
                        currentStatus === option.value && option.activeClass
                      )}
                      onClick={() => setStatus(student.id, option.value)}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="sticky bottom-0 flex flex-col-reverse gap-3 border-t border-border bg-card px-6 py-4 sm:flex-row sm:justify-end">
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
            disabled={isSubmitting || unmarkedCount > 0}
          >
            Save Attendance
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
