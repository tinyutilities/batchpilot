"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Download, Plus } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import StudentStats from "@/components/students/StudentStats";
import StudentFilters from "@/components/students/StudentFilters";
import StudentTable from "@/components/students/StudentTable";
import StudentDeleteDialog from "@/components/students/StudentDeleteDialog";
import AddStudentDialog, {
  type AddStudentDialogConfig,
} from "@/components/students/AddStudentDialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { archiveStudent, deleteStudent, unarchiveStudent } from "@/server/students/actions";
import { useStudents } from "@/lib/hooks/use-students";
import { computeStudentStats } from "@/lib/calculations/student";
import { downloadCsv, toCsv } from "@/lib/csv";
import { toDateKey } from "@/lib/utils";
import type { Student } from "@/types/student";
import type { Batch } from "@/types/batch";

interface StudentsPageClientProps {
  initialStudents: Student[];
  batches: Batch[];
}

export default function StudentsPageClient({
  initialStudents,
  batches,
}: StudentsPageClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { students, mutate: mutateStudents } = useStudents(initialStudents);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedSort, setSelectedSort] = useState("name-asc");

  const [studentPendingDelete, setStudentPendingDelete] =
    useState<Student | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Synchronous initializer so a deep link from the dashboard's "Add
  // Student" Quick Action opens the dialog on first render, with no flash.
  const [addStudentConfig, setAddStudentConfig] =
    useState<AddStudentDialogConfig | null>(() =>
      searchParams.get("addStudent") === "1" ? {} : null,
    );

  useEffect(() => {
    if (searchParams.get("addStudent") === "1") {
      router.replace(pathname, { scroll: false });
    }
    // Idempotent: once the param is stripped, searchParams changes and this
    // simply no-ops on the next run.
  }, [searchParams, pathname, router]);

  const stats = useMemo(() => computeStudentStats(students), [students]);

  const filteredStudents = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    const filtered = students.filter((student) => {
      const matchesSearch =
        query.length === 0 ||
        student.firstName.toLowerCase().includes(query) ||
        student.lastName.toLowerCase().includes(query) ||
        student.fullName.toLowerCase().includes(query) ||
        student.phone.toLowerCase().includes(query) ||
        student.email.toLowerCase().includes(query);

      const matchesBatch =
        selectedBatch === "all" || student.batchId === selectedBatch;

      const matchesStatus =
        selectedStatus === "all" || student.status === selectedStatus;

      return matchesSearch && matchesBatch && matchesStatus;
    });

    const sorted = [...filtered].sort((a, b) => {
      switch (selectedSort) {
        case "name-asc":
          return a.fullName.localeCompare(b.fullName);
        case "name-desc":
          return b.fullName.localeCompare(a.fullName);
        case "attendance-desc":
          return b.attendancePercentage - a.attendancePercentage;
        case "attendance-asc":
          return a.attendancePercentage - b.attendancePercentage;
        case "newest":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case "oldest":
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        default:
          return 0;
      }
    });

    return sorted;
  }, [students, searchTerm, selectedBatch, selectedStatus, selectedSort]);

  function handleResetFilters() {
    setSearchTerm("");
    setSelectedBatch("all");
    setSelectedStatus("all");
    setSelectedSort("name-asc");
  }

  function handleViewStudent(student: Student) {
    router.push(`/dashboard/students/${student.id}`);
  }

  function handleEditStudent(student: Student) {
    router.push(`/dashboard/students/${student.id}/edit`);
  }

  function handleDeleteStudent(student: Student) {
    setStudentPendingDelete(student);
  }

  async function handleConfirmDelete(student: Student) {
    await deleteStudent(student.id);
    mutateStudents(students.filter((s) => s.id !== student.id));
    setStudentPendingDelete(null);
    toast.success(`${student.fullName} was removed from your students.`);
  }

  function handleStudentCreated(student: Student) {
    mutateStudents([student, ...students]);
  }

  async function handleArchiveStudent(student: Student) {
    const ok = await archiveStudent(student.id);
    if (ok) {
      mutateStudents(
        students.map((s) => (s.id === student.id ? { ...s, status: "archived" } : s)),
      );
      toast.success(
        `${student.fullName} was archived. Their history is kept, and they're hidden from the active list.`,
      );
    } else {
      toast.error("Couldn't archive that student. Please try again.");
    }
  }

  async function handleUnarchiveStudent(student: Student) {
    const ok = await unarchiveStudent(student.id);
    if (ok) {
      mutateStudents(
        students.map((s) => (s.id === student.id ? { ...s, status: "active" } : s)),
      );
      toast.success(`${student.fullName} was restored to Active.`);
    } else {
      toast.error("Couldn't unarchive that student. Please try again.");
    }
  }

  // Exports exactly what's currently filtered/sorted on screen, not the
  // whole roster — matches what the teacher is looking at.
  function handleExport() {
    setIsExporting(true);
    try {
      const csv = toCsv(filteredStudents, [
        { header: "Name", value: (s) => s.fullName },
        { header: "Phone", value: (s) => s.phone },
        { header: "Email", value: (s) => s.email },
        { header: "Batch", value: (s) => s.batchName },
        { header: "Status", value: (s) => s.status },
        { header: "Date Joined", value: (s) => s.createdAt.slice(0, 10) },
        { header: "Notes", value: (s) => s.notes ?? "" },
      ]);
      downloadCsv(`batchpilot-students-${toDateKey(new Date())}.csv`, csv);
      toast.success(
        `Exported ${filteredStudents.length} student${filteredStudents.length === 1 ? "" : "s"}.`,
      );
    } catch {
      toast.error("Couldn't generate the export. Please try again.");
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <PageContainer>
      <PageHeader
        title="Students"
        description="Manage student records, attendance, marks and fee information."
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="h-11 gap-2 rounded-xl"
              disabled={isExporting || filteredStudents.length === 0}
              onClick={handleExport}
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              {isExporting ? "Exporting…" : "Export CSV"}
            </Button>
            <Button
              className="h-11 gap-2 rounded-xl"
              onClick={() => setAddStudentConfig({})}
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add Student
            </Button>
          </div>
        }
      />

      {students.length > 0 && <StudentStats stats={stats} />}

      <StudentFilters
        searchTerm={searchTerm}
        selectedBatch={selectedBatch}
        selectedStatus={selectedStatus}
        selectedSort={selectedSort}
        batches={batches}
        onSearchChange={setSearchTerm}
        onBatchChange={setSelectedBatch}
        onStatusChange={setSelectedStatus}
        onSortChange={setSelectedSort}
        onReset={handleResetFilters}
      />

      <StudentTable
        students={filteredStudents}
        isLoading={false}
        hasAnyStudents={students.length > 0}
        onViewStudent={handleViewStudent}
        onEditStudent={handleEditStudent}
        onDeleteStudent={handleDeleteStudent}
        onArchiveStudent={handleArchiveStudent}
        onUnarchiveStudent={handleUnarchiveStudent}
        onAddStudent={() => setAddStudentConfig({})}
      />

      <StudentDeleteDialog
        student={studentPendingDelete}
        onOpenChange={(open) => {
          if (!open) setStudentPendingDelete(null);
        }}
        onConfirm={handleConfirmDelete}
      />

      <AddStudentDialog
        config={addStudentConfig}
        batches={batches}
        onOpenChange={(open) => {
          if (!open) setAddStudentConfig(null);
        }}
        onCreated={handleStudentCreated}
      />
    </PageContainer>
  );
}
