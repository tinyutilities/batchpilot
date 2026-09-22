"use client";

import {
  Archive,
  ArchiveRestore,
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  Users2,
  Phone,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { Student } from "@/types/student";

interface StudentTableProps {
  students: Student[];
  isLoading?: boolean;
  hasAnyStudents?: boolean;
  onViewStudent?: (student: Student) => void;
  onEditStudent?: (student: Student) => void;
  onDeleteStudent?: (student: Student) => void;
  onArchiveStudent?: (student: Student) => void;
  onUnarchiveStudent?: (student: Student) => void;
  onAddStudent?: () => void;
}

function getInitials(firstName: string, lastName: string) {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

function getAttendanceColor(percentage: number) {
  if (percentage >= 90) {
    return {
      text: "text-success",
      bar: "bg-success",
    };
  }
  if (percentage >= 75) {
    return {
      text: "text-secondary-foreground",
      bar: "bg-secondary-foreground",
    };
  }
  if (percentage >= 50) {
    return {
      text: "text-warning",
      bar: "bg-warning",
    };
  }
  return {
    text: "text-destructive",
    bar: "bg-destructive",
  };
}

function AttendanceCell({ percentage }: { percentage: number }) {
  const { text, bar } = getAttendanceColor(percentage);
  return (
    <div className="flex w-28 flex-col gap-1.5">
      <span className={cn("text-sm font-medium", text)}>{percentage}%</span>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full", bar)}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
}

function FeesBadge({ amount }: { amount: number }) {
  if (amount === 0) {
    return (
      <Badge className="rounded-lg border-transparent bg-success-soft text-success hover:bg-success-soft">
        Paid
      </Badge>
    );
  }
  return (
    <Badge className="rounded-lg border-transparent bg-danger-soft text-destructive hover:bg-danger-soft">
      ₹{amount.toLocaleString("en-IN")}
    </Badge>
  );
}

function StatusBadge({ status }: { status: Student["status"] }) {
  if (status === "active") {
    return (
      <Badge className="rounded-lg border-transparent bg-success-soft text-success hover:bg-success-soft">
        Active
      </Badge>
    );
  }
  if (status === "archived") {
    return (
      <Badge className="rounded-lg border-transparent bg-muted text-muted-foreground hover:bg-muted">
        Archived
      </Badge>
    );
  }
  return (
    <Badge className="rounded-lg border-transparent bg-muted text-muted-foreground hover:bg-muted">
      Inactive
    </Badge>
  );
}

function ActionsMenu({
  student,
  onViewStudent,
  onEditStudent,
  onDeleteStudent,
  onArchiveStudent,
  onUnarchiveStudent,
}: {
  student: Student;
  onViewStudent?: (student: Student) => void;
  onEditStudent?: (student: Student) => void;
  onDeleteStudent?: (student: Student) => void;
  onArchiveStudent?: (student: Student) => void;
  onUnarchiveStudent?: (student: Student) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={`Actions for ${student.fullName}`}
          onClick={(e) => e.stopPropagation()}
          className="relative text-muted-foreground before:absolute before:-inset-2 before:content-['']"
        >
          <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
        <DropdownMenuItem onClick={() => onViewStudent?.(student)}>
          <Eye className="mr-2 h-4 w-4" aria-hidden="true" />
          View
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onEditStudent?.(student)}>
          <Pencil className="mr-2 h-4 w-4" aria-hidden="true" />
          Edit
        </DropdownMenuItem>
        {student.status === "archived" ? (
          <DropdownMenuItem onClick={() => onUnarchiveStudent?.(student)}>
            <ArchiveRestore className="mr-2 h-4 w-4" aria-hidden="true" />
            Unarchive
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem onClick={() => onArchiveStudent?.(student)}>
            <Archive className="mr-2 h-4 w-4" aria-hidden="true" />
            Archive
          </DropdownMenuItem>
        )}
        <DropdownMenuItem
          onClick={() => onDeleteStudent?.(student)}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function TableSkeleton() {
  return (
    <div className="hidden md:block">
      <table className="w-full text-left text-sm">
        <thead className="sticky top-0 z-10 bg-card">
          <tr className="border-b border-border">
            {[
              "Student",
              "Batch",
              "Phone",
              "Attendance",
              "Pending Fees",
              "Status",
              "Actions",
            ].map((heading) => (
              <th
                key={heading}
                className="px-6 py-3 font-medium text-muted-foreground"
              >
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 6 }).map((_, index) => (
            <tr
              key={index}
              className="border-b border-border last:border-0"
            >
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-9 w-9 rounded-full" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </td>
              <td className="px-6 py-4">
                <Skeleton className="h-4 w-20" />
              </td>
              <td className="px-6 py-4">
                <Skeleton className="h-4 w-28" />
              </td>
              <td className="px-6 py-4">
                <Skeleton className="h-4 w-16" />
              </td>
              <td className="px-6 py-4">
                <Skeleton className="h-6 w-16 rounded-lg" />
              </td>
              <td className="px-6 py-4">
                <Skeleton className="h-6 w-16 rounded-lg" />
              </td>
              <td className="px-6 py-4">
                <Skeleton className="h-9 w-9 rounded-lg" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function EmptyState({
  hasAnyStudents,
  onAddStudent,
}: {
  hasAnyStudents: boolean;
  onAddStudent?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-10 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <Users2
          className="h-6 w-6 text-muted-foreground"
          aria-hidden="true"
        />
      </div>
      {hasAnyStudents ? (
        <>
          <p className="text-sm font-medium text-foreground">
            No students match your filters
          </p>
          <p className="max-w-xs text-sm text-muted-foreground">
            Try adjusting your search or filters.
          </p>
        </>
      ) : (
        <>
          <p className="text-sm font-medium text-foreground">
            No students yet.
          </p>
          <p className="max-w-xs text-sm text-muted-foreground">
            Add your first student to start tracking attendance, fees and
            marks.
          </p>
          {onAddStudent ? (
            <Button
              type="button"
              className="mt-2 h-11 rounded-xl"
              onClick={onAddStudent}
            >
              Add Student
            </Button>
          ) : (
            <Button asChild className="mt-2 h-11 rounded-xl">
              <Link href="/dashboard/students/new">Add Student</Link>
            </Button>
          )}
        </>
      )}
    </div>
  );
}

export default function StudentTable({
  students,
  isLoading = false,
  hasAnyStudents = false,
  onViewStudent,
  onEditStudent,
  onDeleteStudent,
  onArchiveStudent,
  onUnarchiveStudent,
  onAddStudent,
}: StudentTableProps) {
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card">
        <TableSkeleton />
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card">
        <EmptyState hasAnyStudents={hasAnyStudents} onAddStudent={onAddStudent} />
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-left text-sm">
          <thead className="sticky top-0 z-10 bg-card">
            <tr className="border-b border-border">
              <th scope="col" className="px-6 py-3 font-medium text-muted-foreground">
                Student
              </th>
              <th scope="col" className="px-6 py-3 font-medium text-muted-foreground">
                Batch
              </th>
              <th scope="col" className="px-6 py-3 font-medium text-muted-foreground">
                Phone
              </th>
              <th scope="col" className="px-6 py-3 font-medium text-muted-foreground">
                Attendance
              </th>
              <th scope="col" className="px-6 py-3 font-medium text-muted-foreground">
                Pending Fees
              </th>
              <th scope="col" className="px-6 py-3 font-medium text-muted-foreground">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-right font-medium text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr
                key={student.id}
                tabIndex={0}
                onClick={() => onViewStudent?.(student)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") onViewStudent?.(student);
                }}
                // Row isn't a real <Link> (it contains a nested dropdown
                // trigger button), so warm the detail route on hover/focus
                // instead — Next.js's documented prefetch pattern for
                // custom clickable regions.
                onMouseEnter={() => router.prefetch(`/dashboard/students/${student.id}`)}
                onFocus={() => router.prefetch(`/dashboard/students/${student.id}`)}
                className="cursor-pointer border-b border-border transition-colors last:border-0 hover:bg-muted/60 focus:bg-background focus:outline-none"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      {student.avatar ? (
                        <AvatarImage src={student.avatar} alt={student.fullName} />
                      ) : (
                        <AvatarFallback>
                          {getInitials(student.firstName, student.lastName)}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-medium text-foreground">
                        {student.fullName}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {student.school}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-muted-foreground">
                  {student.batchName}
                </td>
                <td className="px-6 py-4 text-muted-foreground">
                  {student.phone}
                </td>
                <td className="px-6 py-4">
                  <AttendanceCell percentage={student.attendancePercentage} />
                </td>
                <td className="px-6 py-4">
                  <FeesBadge amount={student.pendingFees} />
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={student.status} />
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-end">
                    <ActionsMenu
                      student={student}
                      onViewStudent={onViewStudent}
                      onEditStudent={onEditStudent}
                      onDeleteStudent={onDeleteStudent}
                      onArchiveStudent={onArchiveStudent}
                      onUnarchiveStudent={onUnarchiveStudent}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col divide-y divide-border md:hidden">
        {students.map((student) => (
          <div
            key={student.id}
            role="button"
            tabIndex={0}
            onClick={() => onViewStudent?.(student)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onViewStudent?.(student);
            }}
            onMouseEnter={() => router.prefetch(`/dashboard/students/${student.id}`)}
            onFocus={() => router.prefetch(`/dashboard/students/${student.id}`)}
            className="flex flex-col gap-3 p-4 transition-colors hover:bg-muted/60 focus:bg-background focus:outline-none"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  {student.avatar ? (
                    <AvatarImage src={student.avatar} alt={student.fullName} />
                  ) : (
                    <AvatarFallback>
                      {getInitials(student.firstName, student.lastName)}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="flex flex-col">
                  <span className="font-medium text-foreground">
                    {student.fullName}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {student.batchName}
                  </span>
                </div>
              </div>
              <ActionsMenu
                student={student}
                onViewStudent={onViewStudent}
                onEditStudent={onEditStudent}
                onDeleteStudent={onDeleteStudent}
                onArchiveStudent={onArchiveStudent}
                onUnarchiveStudent={onUnarchiveStudent}
              />
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="h-3.5 w-3.5" aria-hidden="true" />
              {student.phone}
            </div>

            <div className="flex items-center justify-between gap-3">
              <AttendanceCell percentage={student.attendancePercentage} />
              <div className="flex flex-col items-end gap-2">
                <FeesBadge amount={student.pendingFees} />
                <StatusBadge status={student.status} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}