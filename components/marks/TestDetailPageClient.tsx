"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import {
  CheckCircle2,
  ClipboardX,
  Pencil,
  Trash2,
  TrendingUp,
  Users,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import MarksEntryForm from "@/components/marks/MarksEntryForm";
import TestDeleteDialog from "@/components/marks/TestDeleteDialog";
import { deleteTest, saveMarksForTest } from "@/server/marks/actions";
import { computeTestResultSummary } from "@/lib/calculations/marks";
import type { MarkEntryInput, MarkStatus, Test, TestResultSummary } from "@/types/marks";
import type { Student } from "@/types/student";

interface TestDetailPageClientProps {
  testId: string;
  initialTest: Test | null;
  initialSummary: TestResultSummary | null;
  roster: Student[];
  initialMarksMap: Record<string, { marksObtained: number; status: MarkStatus }>;
}

export default function TestDetailPageClient({
  testId,
  initialTest,
  initialSummary,
  roster,
  initialMarksMap,
}: TestDetailPageClientProps) {
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [summary, setSummary] = useState(initialSummary);
  const [marksMap, setMarksMap] = useState(initialMarksMap);
  const [formKey, setFormKey] = useState(0);

  const test = initialTest;

  if (!test || !summary) {
    return (
      <PageContainer className="gap-6">
        <PageHeader
          title="Test not found"
          description="This test may have been removed."
        />
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
            Go back to the marks list to continue.
          </p>
          <Button asChild className="mt-2 h-11 rounded-xl">
            <Link href="/dashboard/marks">Back to Marks</Link>
          </Button>
        </div>
      </PageContainer>
    );
  }

  async function handleSaveMarks(entries: MarkEntryInput[]) {
    setIsSubmitting(true);
    const saved = await saveMarksForTest(testId, entries);
    toast.success(
      `Marks saved for ${entries.length} student${entries.length === 1 ? "" : "s"}.`
    );

    setSummary(computeTestResultSummary(test!, saved, summary!.batchName));
    const nextMap: Record<string, { marksObtained: number; status: MarkStatus }> = {};
    saved.forEach((mark) => {
      nextMap[mark.studentId] = { marksObtained: mark.marksObtained, status: mark.status };
    });
    setMarksMap(nextMap);
    setFormKey((key) => key + 1);
    setIsSubmitting(false);
    router.refresh();
  }

  function handleCancel() {
    router.push("/dashboard/marks");
  }

  const testName = test.name;

  async function handleConfirmDelete() {
    await deleteTest(testId);
    toast.success(`${testName} was deleted.`);
    router.push("/dashboard/marks");
  }

  return (
    <PageContainer className="gap-6">
      <PageHeader
        title={test.name}
        description={`${test.subject} · ${summary.batchName} · ${format(
          new Date(test.testDate),
          "d MMM yyyy"
        )} · Max marks ${test.maxMarks}`}
        action={
          <div className="flex items-center gap-2">
            <Button asChild className="h-11 rounded-xl">
              <Link href={`/dashboard/marks/${testId}/edit`}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit Test
              </Link>
            </Button>
            <Button
              variant="destructive"
              className="h-11 rounded-xl"
              onClick={() => setIsDeleteOpen(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Appeared"
          value={summary.studentsAppeared}
          icon={<Users className="h-5 w-5" />}
          color="indigo"
        />
        <StatCard
          title="Average"
          value={`${summary.averagePercentage}%`}
          icon={<TrendingUp className="h-5 w-5" />}
          color="blue"
        />
        <StatCard
          title="Passed"
          value={summary.passCount}
          icon={<CheckCircle2 className="h-5 w-5" />}
          color="green"
        />
        <StatCard
          title="Failed"
          value={summary.failCount}
          icon={<XCircle className="h-5 w-5" />}
          color="rose"
        />
      </div>

      <MarksEntryForm
        key={formKey}
        students={roster}
        maxMarks={test.maxMarks}
        initialMarks={marksMap}
        isSubmitting={isSubmitting}
        onSave={handleSaveMarks}
        onCancel={handleCancel}
      />

      <TestDeleteDialog
        test={isDeleteOpen ? test : null}
        onOpenChange={setIsDeleteOpen}
        onConfirm={handleConfirmDelete}
      />
    </PageContainer>
  );
}
