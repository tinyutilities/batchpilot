"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import BatchForm from "@/components/batches/BatchForm";
import { createBatch } from "@/server/batches/actions";
import type { BatchFormData } from "@/types/batch";

export default function NewBatchPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleCreate(data: BatchFormData) {
    setIsSubmitting(true);
    try {
      const batchId = await createBatch(data);
      toast.success("Batch created successfully.");
      // Land directly on the new batch with the Add Student dialog ready to
      // go — the onboarding flow is Create Batch -> Open Batch -> Add
      // Student, not back to the list.
      router.push(`/dashboard/batches/${batchId}?addStudent=1`);
      router.refresh();
    } catch (error) {
      setIsSubmitting(false);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to create batch. Please try again.",
      );
    }
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
