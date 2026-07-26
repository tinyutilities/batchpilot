"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import StudentForm from "@/components/students/StudentForm";
import { createStudent } from "@/server/students/actions";
import type { StudentFormData } from "@/types/student";
import type { Batch } from "@/types/batch";

interface NewStudentFormClientProps {
  batches: Batch[];
}

export default function NewStudentFormClient({
  batches,
}: NewStudentFormClientProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleCreate(data: StudentFormData) {
    setIsSubmitting(true);
    const student = await createStudent(data);
    toast.success(`${student.fullName} was added to your students.`);
    router.push("/dashboard/students");
    router.refresh();
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
        batches={batches}
        submitLabel="Add Student"
        isSubmitting={isSubmitting}
        onSubmit={handleCreate}
        onCancel={handleCancel}
      />
    </PageContainer>
  );
}
