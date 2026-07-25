"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import MarksForm from "@/components/marks/MarksForm";
import { createTest } from "@/lib/mock/marks";
import { mockBatches } from "@/lib/mock/batch";
import type { TestFormData } from "@/types/marks";

export default function NewTestPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleCreate(data: TestFormData) {
    setIsSubmitting(true);
    const test = createTest(data);
    toast.success(`${test.name} was created.`);
    router.push(`/dashboard/marks/${test.id}`);
  }

  function handleCancel() {
    router.push("/dashboard/marks");
  }

  return (
    <PageContainer className="gap-6">
      <PageHeader
        title="Create Test"
        description="Set up a new test to start recording marks."
      />

      <MarksForm
        batches={mockBatches}
        submitLabel="Create Test"
        isSubmitting={isSubmitting}
        onSubmit={handleCreate}
        onCancel={handleCancel}
      />
    </PageContainer>
  );
}
