"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import MarksForm from "@/components/marks/MarksForm";
import { createTest } from "@/server/marks/actions";
import type { TestFormData } from "@/types/marks";
import type { Batch } from "@/types/batch";

interface NewTestFormClientProps {
  batches: Batch[];
}

export default function NewTestFormClient({ batches }: NewTestFormClientProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleCreate(data: TestFormData) {
    setIsSubmitting(true);
    const id = await createTest(data);
    toast.success(`${data.name} was created.`);
    router.push(`/dashboard/marks/${id}`);
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
        batches={batches}
        submitLabel="Create Test"
        isSubmitting={isSubmitting}
        onSubmit={handleCreate}
        onCancel={handleCancel}
      />
    </PageContainer>
  );
}
