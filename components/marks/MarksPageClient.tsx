"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Award, ClipboardList, Plus, TrendingDown } from "lucide-react";
import { toast } from "sonner";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { ModuleAlertBanner } from "@/components/dashboard/ModuleAlertBanner";
import MarksStats from "@/components/marks/MarksStats";
import MarksFilters from "@/components/marks/MarksFilters";
import MarksTable from "@/components/marks/MarksTable";
import TestDeleteDialog from "@/components/marks/TestDeleteDialog";
import PerformanceChart from "@/components/shared/PerformanceChart";
import { deleteTest } from "@/server/marks/actions";
import {
  computeMarksStats,
  computeLowestScorer,
  computeSubjectSummaries,
  computeTopScorer,
} from "@/lib/calculations/marks";
import type { MarkRecord, Test, TestResultSummary } from "@/types/marks";
import type { Batch } from "@/types/batch";

interface MarksPageClientProps {
  allSummaries: TestResultSummary[];
  allTests: Test[];
  allMarks: MarkRecord[];
  studentNameById: Record<string, string>;
  batches: Batch[];
}

export default function MarksPageClient({
  allSummaries,
  allTests,
  allMarks,
  studentNameById,
  batches,
}: MarksPageClientProps) {
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("all");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [selectedDate, setSelectedDate] = useState("");
  const [testPendingDelete, setTestPendingDelete] = useState<Test | null>(null);

  const nameMap = useMemo(
    () => new Map(Object.entries(studentNameById)),
    [studentNameById],
  );

  const stats = useMemo(
    () => computeMarksStats(allTests, allMarks),
    [allTests, allMarks],
  );
  const topScorer = useMemo(
    () => computeTopScorer(allTests, allMarks, nameMap),
    [allTests, allMarks, nameMap],
  );
  const lowestScorer = useMemo(
    () => computeLowestScorer(allTests, allMarks, nameMap),
    [allTests, allMarks, nameMap],
  );
  const subjectSummaries = useMemo(
    () => computeSubjectSummaries(allTests, allMarks),
    [allTests, allMarks],
  );
  const testsWithoutMarks = useMemo(
    () => allSummaries.filter((summary) => summary.studentsAppeared === 0),
    [allSummaries],
  );

  const subjects = useMemo(
    () => Array.from(new Set(allTests.map((test) => test.subject))).sort(),
    [allTests],
  );

  const filteredSummaries = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return allSummaries.filter((summary) => {
      const matchesSearch =
        query.length === 0 ||
        summary.test.name.toLowerCase().includes(query) ||
        summary.batchName.toLowerCase().includes(query);
      const matchesBatch =
        selectedBatch === "all" || summary.test.batchId === selectedBatch;
      const matchesSubject =
        selectedSubject === "all" || summary.test.subject === selectedSubject;
      const matchesDate =
        !selectedDate || summary.test.testDate === selectedDate;

      return matchesSearch && matchesBatch && matchesSubject && matchesDate;
    });
  }, [allSummaries, searchTerm, selectedBatch, selectedSubject, selectedDate]);

  function handleResetFilters() {
    setSearchTerm("");
    setSelectedBatch("all");
    setSelectedSubject("all");
    setSelectedDate("");
  }

  function handleViewResults(summary: TestResultSummary) {
    router.push(`/dashboard/marks/${summary.test.id}`);
  }

  function handleEditTest(summary: TestResultSummary) {
    router.push(`/dashboard/marks/${summary.test.id}/edit`);
  }

  function handleDeleteTest(summary: TestResultSummary) {
    setTestPendingDelete(summary.test);
  }

  async function handleConfirmDelete(test: Test) {
    await deleteTest(test.id);
    toast.success(`${test.name} was deleted.`);
    setTestPendingDelete(null);
    router.refresh();
  }

  return (
    <PageContainer>
      <PageHeader
        title="Marks"
        description="Record, edit and review student test performance."
        action={
          <Button asChild className="h-11 gap-2 rounded-xl">
            <Link href="/dashboard/marks/new">
              <Plus className="h-4 w-4" aria-hidden="true" />
              Create Test
            </Link>
          </Button>
        }
      />

      {testsWithoutMarks.length > 0 && (
        <ModuleAlertBanner
          title={`${testsWithoutMarks.length} test${testsWithoutMarks.length === 1 ? "" : "s"} without marks entered`}
          description={testsWithoutMarks
            .map((summary) => summary.test.name)
            .join(", ")}
        />
      )}

      {allSummaries.length > 0 && <MarksStats stats={stats} />}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <DashboardCard title="Highest Scorer" description="Best result across all tests">
          {topScorer ? (
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                <Award className="h-5 w-5" aria-hidden="true" />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="font-medium text-foreground">
                  {topScorer.studentName}
                </span>
                <span className="text-sm text-muted-foreground">
                  {topScorer.percentage}%
                </span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No results yet.</p>
          )}
        </DashboardCard>

        <DashboardCard title="Lowest Scorer" description="Needs the most support">
          {lowestScorer ? (
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">
                <TrendingDown className="h-5 w-5" aria-hidden="true" />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="font-medium text-foreground">
                  {lowestScorer.studentName}
                </span>
                <span className="text-sm text-muted-foreground">
                  {lowestScorer.percentage}%
                </span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No results yet.</p>
          )}
        </DashboardCard>

        <DashboardCard
          title="Subject Summaries"
          description="Average score by subject"
        >
          <PerformanceChart
            data={subjectSummaries.map((s) => ({
              label: s.subject,
              percentage: s.averagePercentage,
            }))}
          />
        </DashboardCard>
      </div>

      <MarksFilters
        searchTerm={searchTerm}
        selectedBatch={selectedBatch}
        selectedSubject={selectedSubject}
        selectedDate={selectedDate}
        batches={batches}
        subjects={subjects}
        onSearchChange={setSearchTerm}
        onBatchChange={setSelectedBatch}
        onSubjectChange={setSelectedSubject}
        onDateChange={setSelectedDate}
        onReset={handleResetFilters}
      />

      {allSummaries.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-6 py-10 text-center dark:border-slate-800 dark:bg-slate-950">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
            <ClipboardList
              className="h-6 w-6 text-muted-foreground"
              aria-hidden="true"
            />
          </div>
          <p className="text-sm font-medium text-foreground">
            Create your first test.
          </p>
          <p className="max-w-xs text-sm text-muted-foreground">
            Create a test to start recording marks for a batch.
          </p>
          <Button asChild className="mt-2 h-11 rounded-xl">
            <Link href="/dashboard/marks/new">Create Test</Link>
          </Button>
        </div>
      ) : (
        <MarksTable
          summaries={filteredSummaries}
          isLoading={false}
          onViewResults={handleViewResults}
          onEditTest={handleEditTest}
          onDeleteTest={handleDeleteTest}
        />
      )}

      <TestDeleteDialog
        test={testPendingDelete}
        onOpenChange={(open) => {
          if (!open) setTestPendingDelete(null);
        }}
        onConfirm={handleConfirmDelete}
      />
    </PageContainer>
  );
}
