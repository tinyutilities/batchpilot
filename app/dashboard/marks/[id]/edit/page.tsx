"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ClipboardX } from "lucide-react";
import { toast } from "sonner";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import MarksForm from "@/components/marks/MarksForm";
import { getTestById, updateTest } from "@/lib/mock/marks";
import { mockBatches } from "@/lib/mock/batch";
import type { TestFormData } from "@/types/marks";

export default function EditTestPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const testId = params.id;

  const [isSubmitting, setIsSubmitting] = useState(false);

  const test = useMemo(() => getTestById(testId), [testId]);

  if (!test) {
    return (
      <PageContainer className="gap-6">
        <PageHeader title="Edit Test" description="Update a test's details." />
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-6 py-10 text-center dark:border-slate-800 dark:bg-slate-950">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
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

  function handleUpdate(data: TestFormData) {
    setIsSubmitting(true);
    const updated = updateTest(testId, data);
    if (updated) {
      toast.success(`${updated.name} was updated.`);
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
        batches={mockBatches}
        initialValues={initialValues}
        submitLabel="Save Changes"
        isSubmitting={isSubmitting}
        onSubmit={handleUpdate}
        onCancel={handleCancel}
      />
    </PageContainer>
  );
}
