"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import StudentStats from "@/components/students/StudentStats";
import StudentFilters from "@/components/students/StudentFilters";
import StudentTable from "@/components/students/StudentTable";
import StudentDeleteDialog from "@/components/students/StudentDeleteDialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { deleteStudent } from "@/server/students/actions";
import { computeStudentStats } from "@/lib/calculations/student";
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

  const [students, setStudents] = useState<Student[]>(initialStudents);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedSort, setSelectedSort] = useState("name-asc");

  const [studentPendingDelete, setStudentPendingDelete] =
    useState<Student | null>(null);

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
    setStudents((prev) => prev.filter((s) => s.id !== student.id));
    setStudentPendingDelete(null);
    toast.success(`${student.fullName} was removed from your students.`);
    router.refresh();
  }

  return (
    <PageContainer>
      <PageHeader
        title="Students"
        description="Manage student records, attendance, marks and fee information."
        action={
          <Button asChild className="h-11 gap-2 rounded-xl">
            <Link href="/dashboard/students/new">
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add Student
            </Link>
          </Button>
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
      />

      <StudentDeleteDialog
        student={studentPendingDelete}
        onOpenChange={(open) => {
          if (!open) setStudentPendingDelete(null);
        }}
        onConfirm={handleConfirmDelete}
      />
    </PageContainer>
  );
}
