"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import StudentForm from "@/components/students/StudentForm";
import { createStudent } from "@/lib/mock/student";
import { mockBatches } from "@/lib/mock/batch";
import type { StudentFormData } from "@/types/student";

export default function AddStudentPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleCreate(data: StudentFormData) {
    setIsSubmitting(true);
    const student = createStudent(data);
    toast.success(`${student.fullName} was added to your students.`);
    router.push("/dashboard/students");
  }

  function handleCancel() {
    router.push("/dashboard/students");
  }

  return (
    <PageContainer className="gap-6">
      <PageHeader
        title="Add Student"
        description="Register a new student into a tuition batch."
      />

      <StudentForm
        batches={mockBatches}
        submitLabel="Add Student"
        isSubmitting={isSubmitting}
        onSubmit={handleCreate}
        onCancel={handleCancel}
      />
    </PageContainer>
  );
}
