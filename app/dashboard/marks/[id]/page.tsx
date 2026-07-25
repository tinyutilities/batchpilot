"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
import {
  deleteTest,
  getMarksByTest,
  getTestById,
  getTestResultSummary,
  saveMarksForTest,
} from "@/lib/mock/marks";
import { getStudentsByBatch } from "@/lib/mock/batch";

export default function TestDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const testId = params.id;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const test = useMemo(
    () => getTestById(testId),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [testId, refreshKey]
  );
  const summary = useMemo(
    () => getTestResultSummary(testId),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [testId, refreshKey]
  );
  const roster = useMemo(
    () => (test ? getStudentsByBatch(test.batchId) : []),
    [test]
  );
  const initialMarks = useMemo(() => {
    const map: Record<string, { marksObtained: number; status: "present" | "absent" }> = {};
    getMarksByTest(testId).forEach((mark) => {
      map[mark.studentId] = { marksObtained: mark.marksObtained, status: mark.status };
    });
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [testId, refreshKey]);

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

  function handleSaveMarks(
    entries: Parameters<typeof saveMarksForTest>[1]
  ) {
    setIsSubmitting(true);
    saveMarksForTest(testId, entries);
    toast.success(`Marks saved for ${entries.length} student${entries.length === 1 ? "" : "s"}.`);
    setRefreshKey((key) => key + 1);
    setIsSubmitting(false);
  }

  function handleCancel() {
    router.push("/dashboard/marks");
  }

  const testName = test.name;

  function handleConfirmDelete() {
    deleteTest(testId);
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
        key={refreshKey}
        students={roster}
        maxMarks={test.maxMarks}
        initialMarks={initialMarks}
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
