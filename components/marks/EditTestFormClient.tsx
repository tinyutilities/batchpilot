"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ClipboardX } from "lucide-react";
import { toast } from "sonner";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import MarksForm from "@/components/marks/MarksForm";
import { updateTest } from "@/server/marks/actions";
import type { Test, TestFormData } from "@/types/marks";
import type { Batch } from "@/types/batch";

interface EditTestFormClientProps {
  testId: string;
  test: Test | null;
  batches: Batch[];
}

export default function EditTestFormClient({
  testId,
  test,
  batches,
}: EditTestFormClientProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!test) {
    return (
      <PageContainer className="gap-6">
        <PageHeader title="Edit Test" description="Update a test's details." />
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-card px-6 py-10 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <ClipboardX
              className="h-6 w-6 text-muted-foreground"
              aria-hidden="true"
            />
          </div>
          <p className="text-sm font-medium text-foreground">
            Test not found
          </p>
          <p className="max-w-xs text-sm text-muted-foreground">
            This test may have been removed. Go back to the marks list to
            continue.
          </p>
          <Button asChild className="mt-2 h-11 rounded-xl">
            <Link href="/dashboard/marks">Back to Marks</Link>
          </Button>
        </div>
      </PageContainer>
    );
  }

  const initialValues: Partial<TestFormData> = {
    name: test.name,
    subject: test.subject,
    batchId: test.batchId,
    maxMarks: test.maxMarks,
    testDate: test.testDate,
    remarks: test.remarks ?? "",
  };

  async function handleUpdate(data: TestFormData) {
    setIsSubmitting(true);
    const updated = await updateTest(testId, data);
    if (updated) {
      toast.success(`${data.name} was updated.`);
    }
    router.push(`/dashboard/marks/${testId}`);
  }

  function handleCancel() {
    router.push(`/dashboard/marks/${testId}`);
  }

  return (
    <PageContainer className="gap-6">
      <PageHeader
        title={`Edit ${test.name}`}
        description="Update this test's details."
      />

      <MarksForm
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
