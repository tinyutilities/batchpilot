"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import {
  CalendarClock,
  Copy,
  ExternalLink,
  Gauge,
  LayersIcon,
  Pencil,
  Trash2,
  UserMinus,
  UserPlus,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import BatchDeleteDialog from "@/components/batches/BatchDeleteDialog";
import AddStudentDialog from "@/components/students/AddStudentDialog";
import {
  assignStudentToBatch,
  deleteBatch,
  removeStudentFromBatch,
} from "@/server/batches/actions";
import { formatBatchSchedule } from "@/lib/calculations/batch";
import type { BatchWithRoster } from "@/types/batch";
import type { Student } from "@/types/student";

function getInitials(firstName: string, lastName: string) {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

interface BatchDetailPageClientProps {
  batchId: string;
  initialBatch: BatchWithRoster | null;
  initialAllStudents: Student[];
}

export default function BatchDetailPageClient({
  batchId,
  initialBatch,
  initialAllStudents,
}: BatchDetailPageClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [roster, setRoster] = useState<Student[]>(
    initialBatch?.students ?? [],
  );
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  // Synchronous initializer so landing here straight from Create Batch opens
  // the dialog on first render, with no flash.
  const [addStudentOpen, setAddStudentOpen] = useState(
    () => searchParams.get("addStudent") === "1",
  );

  useEffect(() => {
    if (searchParams.get("addStudent") === "1") {
      router.replace(pathname, { scroll: false });
    }
    // Idempotent: once the param is stripped, searchParams changes and this
    // simply no-ops on the next run.
  }, [searchParams, pathname, router]);

  const availableStudents = useMemo(
    () =>
      initialAllStudents.filter(
        (student) => !roster.some((enrolled) => enrolled.id === student.id),
      ),
    [initialAllStudents, roster],
  );

  if (!initialBatch) {
    return (
      <PageContainer className="gap-6">
        <PageHeader
          title="Batch not found"
          description="This batch may have been removed."
        />
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-6 py-10 text-center dark:border-slate-800 dark:bg-slate-950">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
            <LayersIcon
              className="h-6 w-6 text-muted-foreground"
              aria-hidden="true"
            />
          </div>
          <p className="text-sm font-medium text-foreground">
            Batch not found
          </p>
          <p className="max-w-xs text-sm text-muted-foreground">
            Go back to the batch list to continue.
          </p>
          <Button asChild className="mt-2 h-11 rounded-xl">
            <Link href="/dashboard/batches">Back to Batches</Link>
          </Button>
        </div>
      </PageContainer>
    );
  }

  const batch = initialBatch;
  const capacityPercentage =
    batch.capacity > 0
      ? Math.round((roster.length / batch.capacity) * 100)
      : 0;

  const batchName = batch.name;
  const meetLink = batch.googleMeetLink;

  function handleCopyLink() {
    if (!meetLink) return;
    navigator.clipboard.writeText(meetLink);
    toast.success("Meet link copied to clipboard.");
  }

  async function handleAddStudent() {
    if (!selectedStudentId) return;
    const updated = await assignStudentToBatch(selectedStudentId, batchId);
    if (updated) {
      setRoster((prev) => [...prev, updated]);
      setSelectedStudentId("");
      toast.success(`${updated.fullName} was added to ${batchName}.`);
      router.refresh();
    }
  }

  async function handleRemoveStudent(student: Student) {
    const updated = await removeStudentFromBatch(student.id);
    if (updated) {
      setRoster((prev) => prev.filter((s) => s.id !== student.id));
      toast.success(`${student.fullName} was removed from ${batchName}.`);
      router.refresh();
    }
  }

  function handleStudentCreated(student: Student) {
    setRoster((prev) => [...prev, student]);
    router.refresh();
  }

  async function handleConfirmDelete() {
    const deleted = await deleteBatch(batchId);
    if (deleted) {
      toast.success(`${batchName} was deleted.`);
      router.push("/dashboard/batches");
    }
    setIsDeleteOpen(false);
  }

  return (
    <PageContainer className="gap-6">
      <PageHeader
        title={batch.name}
        description="Batch details and student roster."
        action={
          <div className="flex items-center gap-2">
            <Button asChild className="h-11 rounded-xl">
              <Link href={`/dashboard/batches/${batch.id}/edit`}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit Batch
              </Link>
            </Button>
            <Button
              variant="destructive"
              className="h-11 rounded-xl"
              onClick={() => setIsDeleteOpen(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-1">
          <DashboardCard title="Batch Information">
            <div className="flex flex-col gap-4">
              <div>
                {batch.status === "active" ? (
                  <Badge className="rounded-full bg-emerald-50 text-emerald-600 hover:bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400">
                    Active
                  </Badge>
                ) : (
                  <Badge className="rounded-full bg-slate-100 text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-400">
                    Inactive
                  </Badge>
                )}
              </div>

              <dl className="flex flex-col gap-3 text-sm">
                {batch.subject && (
                  <div className="flex flex-col gap-1">
                    <dt className="text-xs font-medium text-muted-foreground">
                      Subject
                    </dt>
                    <dd className="font-medium text-foreground">
                      {batch.subject}
                    </dd>
                  </div>
                )}
                <div className="flex flex-col gap-1">
                  <dt className="text-xs font-medium text-muted-foreground">
                    Teacher
                  </dt>
                  <dd className="font-medium text-foreground">
                    {batch.teacherName}
                  </dd>
                </div>
                <div className="flex flex-col gap-1">
                  <dt className="text-xs font-medium text-muted-foreground">
                    Schedule
                  </dt>
                  <dd className="flex items-center gap-2 font-medium text-foreground">
                    <CalendarClock
                      className="h-4 w-4 shrink-0 text-slate-400"
                      aria-hidden="true"
                    />
                    {formatBatchSchedule(batch.schedule)}
                  </dd>
                </div>
                <div className="flex flex-col gap-1">
                  <dt className="text-xs font-medium text-muted-foreground">
                    Monthly Fee
                  </dt>
                  <dd className="font-medium text-foreground">
                    {batch.monthlyFee != null
                      ? `₹${batch.monthlyFee.toLocaleString("en-IN")}`
                      : "Not set"}
                  </dd>
                </div>
                <div className="flex flex-col gap-1">
                  <dt className="text-xs font-medium text-muted-foreground">
                    Created
                  </dt>
                  <dd className="font-medium text-foreground">
                    {format(new Date(batch.createdAt), "d MMM yyyy")}
                  </dd>
                </div>
              </dl>
            </div>
          </DashboardCard>

          <div className="grid grid-cols-2 gap-4">
            <StatCard
              title="Enrolled"
              value={
                batch.capacity > 0
                  ? `${roster.length} / ${batch.capacity}`
                  : `${roster.length}`
              }
              description={batch.capacity > 0 ? undefined : "Unlimited capacity"}
              icon={<Users className="h-5 w-5" />}
              color="blue"
            />
            <StatCard
              title="Capacity Usage"
              value={batch.capacity > 0 ? `${capacityPercentage}%` : "—"}
              icon={<Gauge className="h-5 w-5" />}
              color={
                batch.capacity === 0
                  ? "indigo"
                  : capacityPercentage >= 100
                    ? "rose"
                    : capacityPercentage >= 80
                      ? "amber"
                      : "green"
              }
            />
          </div>

          <DashboardCard title="Google Meet">
            {batch.googleMeetLink ? (
              <div className="flex flex-col gap-3">
                <p className="truncate text-sm text-muted-foreground">
                  {batch.googleMeetLink}
                </p>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-10 flex-1 gap-2 rounded-xl"
                    onClick={handleCopyLink}
                  >
                    <Copy className="h-4 w-4" aria-hidden="true" />
                    Copy Link
                  </Button>
                  <Button asChild className="h-10 flex-1 gap-2 rounded-xl">
                    <a
                      href={batch.googleMeetLink}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4" aria-hidden="true" />
                      Open
                    </a>
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No meeting link has been added for this batch yet.
              </p>
            )}
          </DashboardCard>
        </div>

        <div className="flex flex-col gap-6 lg:col-span-2">
          <DashboardCard
            title="Student Roster"
            description={`${roster.length} student${
              roster.length === 1 ? "" : "s"
            } enrolled`}
          >
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2 sm:flex-row">
                <Select
                  value={selectedStudentId}
                  onValueChange={setSelectedStudentId}
                >
                  <SelectTrigger className="h-11 flex-1 rounded-xl">
                    <SelectValue placeholder="Select an existing student to add" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableStudents.length === 0 ? (
                      <div className="px-3 py-2 text-sm text-muted-foreground">
                        No other students available
                      </div>
                    ) : (
                      availableStudents.map((student) => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.fullName}
                          {student.batchName
                            ? ` — ${student.batchName}`
                            : ""}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  className="h-11 gap-2 rounded-xl sm:w-auto"
                  disabled={!selectedStudentId}
                  onClick={handleAddStudent}
                >
                  <UserPlus className="h-4 w-4" aria-hidden="true" />
                  Add
                </Button>
              </div>
              <Button
                type="button"
                variant="outline"
                className="h-11 w-fit gap-2 rounded-xl"
                onClick={() => setAddStudentOpen(true)}
              >
                <UserPlus className="h-4 w-4" aria-hidden="true" />
                Add New Student
              </Button>
              {capacityPercentage >= 100 && (
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  This batch is at or over capacity.
                </p>
              )}

              {roster.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-200 px-6 py-10 text-center dark:border-slate-800">
                  <p className="text-sm font-medium text-foreground">
                    No students yet
                  </p>
                  <p className="max-w-xs text-sm text-muted-foreground">
                    Add students to this batch using the picker above.
                  </p>
                </div>
              ) : (
                <div className="-mx-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Attendance</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {roster.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell>
                          <Link
                            href={`/dashboard/students/${student.id}`}
                            className="flex items-center gap-3 hover:underline"
                          >
                            <Avatar className="h-9 w-9">
                              <AvatarFallback>
                                {getInitials(
                                  student.firstName,
                                  student.lastName
                                )}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium text-foreground">
                              {student.fullName}
                            </span>
                          </Link>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {student.phone}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {student.attendancePercentage}%
                        </TableCell>
                        <TableCell>
                          {student.status === "active" ? (
                            <Badge className="rounded-full bg-emerald-50 text-emerald-600 hover:bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400">
                              Active
                            </Badge>
                          ) : (
                            <Badge className="rounded-full bg-slate-100 text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-400">
                              Inactive
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`Remove ${student.fullName} from batch`}
                            onClick={() => handleRemoveStudent(student)}
                          >
                            <UserMinus
                              className="h-4 w-4 text-muted-foreground"
                              aria-hidden="true"
                            />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                </div>
              )}
            </div>
          </DashboardCard>
        </div>
      </div>

      <BatchDeleteDialog
        batch={isDeleteOpen ? batch : null}
        enrolledCount={roster.length}
        onOpenChange={setIsDeleteOpen}
        onConfirm={handleConfirmDelete}
      />

      <AddStudentDialog
        config={addStudentOpen ? { defaultBatchId: batch.id, lockBatch: true } : null}
        batches={[batch]}
        onOpenChange={setAddStudentOpen}
        onCreated={handleStudentCreated}
      />
    </PageContainer>
  );
}
