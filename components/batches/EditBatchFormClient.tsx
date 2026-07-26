"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LayersIcon } from "lucide-react";
import { toast } from "sonner";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import BatchForm from "@/components/batches/BatchForm";
import { updateBatch } from "@/server/batches/actions";
import type { Batch, BatchFormData } from "@/types/batch";

interface EditBatchFormClientProps {
  batchId: string;
  batch: Batch | null;
}

export default function EditBatchFormClient({
  batchId,
  batch,
}: EditBatchFormClientProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!batch) {
    return (
      <PageContainer className="gap-6">
        <PageHeader title="Edit Batch" description="Update a batch's details." />
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
            This batch may have been removed. Go back to the batch list to
            continue.
          </p>
          <Button asChild className="mt-2 h-11 rounded-xl">
            <Link href="/dashboard/batches">Back to Batches</Link>
          </Button>
        </div>
      </PageContainer>
    );
  }

  const initialValues: Partial<BatchFormData> = {
    name: batch.name,
    subject: batch.subject,
    googleMeetLink: batch.googleMeetLink,
    schedule: batch.schedule,
    capacity: batch.capacity,
    status: batch.status,
    monthlyFee: batch.monthlyFee ?? undefined,
  };

  async function handleUpdate(data: BatchFormData) {
    setIsSubmitting(true);
    const updated = await updateBatch(batchId, data);
    if (updated) {
      toast.success(`${data.name}'s details were updated.`);
    }
    router.push(`/dashboard/batches/${batchId}`);
    router.refresh();
  }

  function handleCancel() {
    router.push(`/dashboard/batches/${batchId}`);
  }

  return (
    <PageContainer className="gap-6">
      <PageHeader
        title={`Edit ${batch.name}`}
        description="Update this batch's details."
      />

      <BatchForm
        initialValues={initialValues}
        submitLabel="Save Changes"
        isSubmitting={isSubmitting}
        onSubmit={handleUpdate}
        onCancel={handleCancel}
      />
    </PageContainer>
  );
}
