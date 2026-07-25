"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import BatchForm from "@/components/batches/BatchForm";
import { createBatch } from "@/lib/mock/batch";
import { useTeacherSettings } from "@/lib/hooks/use-teacher-settings";
import type { BatchFormData } from "@/types/batch";

export default function NewBatchPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { profile } = useTeacherSettings();

  function handleCreate(data: BatchFormData) {
    setIsSubmitting(true);
    const batch = createBatch(data, profile.fullName);
    toast.success(`${batch.name} was created.`);
    router.push("/dashboard/batches");
  }

  function handleCancel() {
    router.push("/dashboard/batches");
  }

  return (
    <PageContainer className="gap-6">
      <PageHeader
        title="Create Batch"
        description="Set up a new batch to start adding students."
      />

      <BatchForm
        submitLabel="Create Batch"
        isSubmitting={isSubmitting}
        onSubmit={handleCreate}
        onCancel={handleCancel}
      />
    </PageContainer>
  );
}
