"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserX } from "lucide-react";
import { toast } from "sonner";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import StudentForm from "@/components/students/StudentForm";
import { updateStudent } from "@/server/students/actions";
import type { Student, StudentFormData } from "@/types/student";
import type { Batch } from "@/types/batch";

interface EditStudentFormClientProps {
  studentId: string;
  student: Student | null;
  batches: Batch[];
}

export default function EditStudentFormClient({
  studentId,
  student,
  batches,
}: EditStudentFormClientProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!student) {
    return (
      <PageContainer className="gap-6">
        <PageHeader
          title="Edit Student"
          description="Update a student's details."
        />
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-card px-6 py-10 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <UserX
              className="h-6 w-6 text-muted-foreground"
              aria-hidden="true"
            />
          </div>
          <p className="text-sm font-medium text-foreground">
            Student not found
          </p>
          <p className="max-w-xs text-sm text-muted-foreground">
            This student may have been removed. Go back to the student list
            to continue.
          </p>
          <Button asChild className="mt-2 h-11 rounded-xl">
            <Link href="/dashboard/students">Back to Students</Link>
          </Button>
        </div>
      </PageContainer>
    );
  }

  const initialValues: Partial<StudentFormData> = {
    firstName: student.firstName,
    lastName: student.lastName,
    email: student.email,
    phone: student.phone,
    gender: student.gender,
    dateOfBirth: student.dateOfBirth,
    guardianName: student.guardianName,
    guardianPhone: student.guardianPhone,
    address: student.address,
    batchId: student.batchId,
    school: student.school,
    status: student.status,
    notes: student.notes,
  };

  async function handleUpdate(data: StudentFormData) {
    setIsSubmitting(true);
    const updated = await updateStudent(studentId, data);
    if (updated) {
      toast.success(`${data.firstName} ${data.lastName}'s details were updated.`);
    }
    router.push(`/dashboard/students/${studentId}`);
  }

  function handleCancel() {
    router.push(`/dashboard/students/${studentId}`);
  }

  return (
    <PageContainer className="gap-6">
      <PageHeader
        title={`Edit ${student.fullName}`}
        description="Update this student's details."
      />

      <StudentForm
        batches={batches}
        initialValues={initialValues}
        submitLabel="Save Changes"
        isSubmitting={isSubmitting}
        onSubmit={handleUpdate}
        onCancel={handleCancel}
      />
    </PageContainer>
  );
}
