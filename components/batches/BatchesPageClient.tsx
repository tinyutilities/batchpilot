"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Layers, Plus } from "lucide-react";
import { toast } from "sonner";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { ModuleAlertBanner } from "@/components/dashboard/ModuleAlertBanner";
import BatchStats from "@/components/batches/BatchStats";
import BatchFilters from "@/components/batches/BatchFilters";
import BatchCard from "@/components/batches/BatchCard";
import BatchDeleteDialog from "@/components/batches/BatchDeleteDialog";
import AddStudentDialog from "@/components/students/AddStudentDialog";
import { deleteBatch } from "@/server/batches/actions";
import { useBatches } from "@/lib/hooks/use-batches";
import { computeBatchStats } from "@/lib/calculations/batch";
import type { Batch } from "@/types/batch";

interface BatchesPageClientProps {
  initialBatches: Batch[];
  initialEnrollmentCounts: Record<string, number>;
}

export default function BatchesPageClient({
  initialBatches,
  initialEnrollmentCounts,
}: BatchesPageClientProps) {
  const router = useRouter();

  const {
    batches,
    enrollmentCounts: enrollmentCountsRecord,
    mutate: mutateBatches,
    mutateEnrollmentCounts,
  } = useBatches(initialBatches, initialEnrollmentCounts);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedSort, setSelectedSort] = useState("name-asc");

  const [batchPendingDelete, setBatchPendingDelete] = useState<Batch | null>(
    null,
  );
  const [addStudentTarget, setAddStudentTarget] = useState<Batch | null>(
    null,
  );

  const enrollmentCounts = useMemo(
    () => new Map(Object.entries(enrollmentCountsRecord)),
    [enrollmentCountsRecord],
  );

  const stats = useMemo(
    () => computeBatchStats(batches, enrollmentCounts),
    [batches, enrollmentCounts],
  );

  const subjects = useMemo(() => {
    return Array.from(
      new Set(batches.map((batch) => batch.subject).filter(Boolean)),
    ).sort((a, b) => a.localeCompare(b));
  }, [batches]);

  const emptyBatches = useMemo(
    () => batches.filter((batch) => !enrollmentCounts.get(batch.id)),
    [batches, enrollmentCounts],
  );

  const filteredBatches = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    const filtered = batches.filter((batch) => {
      const matchesSearch =
        query.length === 0 ||
        batch.name.toLowerCase().includes(query) ||
        batch.subject.toLowerCase().includes(query) ||
        batch.teacherName.toLowerCase().includes(query);

      const matchesSubject =
        selectedSubject === "all" || batch.subject === selectedSubject;

      const matchesStatus =
        selectedStatus === "all" || batch.status === selectedStatus;

      return matchesSearch && matchesSubject && matchesStatus;
    });

    const sorted = [...filtered].sort((a, b) => {
      switch (selectedSort) {
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "enrolled-desc":
          return (
            (enrollmentCounts.get(b.id) ?? 0) -
            (enrollmentCounts.get(a.id) ?? 0)
          );
        case "enrolled-asc":
          return (
            (enrollmentCounts.get(a.id) ?? 0) -
            (enrollmentCounts.get(b.id) ?? 0)
          );
        // 0 means unlimited — treat as the highest capacity, not the lowest.
        case "capacity-desc":
          return (
            (b.capacity || Infinity) - (a.capacity || Infinity)
          );
        case "capacity-asc":
          return (
            (a.capacity || Infinity) - (b.capacity || Infinity)
          );
        case "newest":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case "oldest":
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        default:
          return 0;
      }
    });

    return sorted;
  }, [
    batches,
    searchTerm,
    selectedSubject,
    selectedStatus,
    selectedSort,
    enrollmentCounts,
  ]);

  function handleResetFilters() {
    setSearchTerm("");
    setSelectedSubject("all");
    setSelectedStatus("all");
    setSelectedSort("name-asc");
  }

  function handleViewBatch(batch: Batch) {
    router.push(`/dashboard/batches/${batch.id}`);
  }

  function handleEditBatch(batch: Batch) {
    router.push(`/dashboard/batches/${batch.id}/edit`);
  }

  function handleDeleteBatch(batch: Batch) {
    setBatchPendingDelete(batch);
  }

  function handleAddStudentToBatch(batch: Batch) {
    setAddStudentTarget(batch);
  }

  // AddStudentDialog already shows its own success toast — this just keeps
  // the enrollment-count-derived "empty batch" banner accurate.
  function handleStudentCreated() {
    mutateEnrollmentCounts();
  }

  async function handleConfirmDelete(batch: Batch) {
    const deleted = await deleteBatch(batch.id);
    if (deleted) {
      mutateBatches(batches.filter((b) => b.id !== batch.id));
      toast.success(`${batch.name} was deleted.`);
    }
    setBatchPendingDelete(null);
  }

  return (
    <PageContainer>
      <PageHeader
        title="Batches"
        description="Manage tuition batches, schedules and enrollment."
        action={
          <Button asChild className="h-11 gap-2 rounded-xl">
            <Link href="/dashboard/batches/new">
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add Batch
            </Link>
          </Button>
        }
      />

      {emptyBatches.length > 0 && (
        <ModuleAlertBanner
          title={`${emptyBatches.length} empty batch${emptyBatches.length === 1 ? "" : "es"}`}
          description={emptyBatches.map((batch) => batch.name).join(", ")}
        />
      )}

      {batches.length > 0 && <BatchStats stats={stats} />}

      <BatchFilters
        searchTerm={searchTerm}
        selectedSubject={selectedSubject}
        selectedStatus={selectedStatus}
        selectedSort={selectedSort}
        subjects={subjects}
        onSearchChange={setSearchTerm}
        onSubjectChange={setSelectedSubject}
        onStatusChange={setSelectedStatus}
        onSortChange={setSelectedSort}
        onReset={handleResetFilters}
      />

      {filteredBatches.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-6 py-10 text-center dark:border-slate-800 dark:bg-slate-950">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
            <Layers
              className="h-6 w-6 text-muted-foreground"
              aria-hidden="true"
            />
          </div>
          {batches.length === 0 ? (
            <>
              <p className="text-sm font-medium text-foreground">
                Create your first batch.
              </p>
              <p className="max-w-xs text-sm text-muted-foreground">
                You&apos;ll need a batch before you can start enrolling students.
              </p>
              <Button asChild className="mt-2 h-11 rounded-xl">
                <Link href="/dashboard/batches/new">Create Batch</Link>
              </Button>
            </>
          ) : (
            <>
              <p className="text-sm font-medium text-foreground">
                No batches match your filters
              </p>
              <p className="max-w-xs text-sm text-muted-foreground">
                Try adjusting your search or filters.
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredBatches.map((batch) => (
            <BatchCard
              key={batch.id}
              batch={batch}
              enrolledCount={enrollmentCounts.get(batch.id) ?? 0}
              onView={handleViewBatch}
              onEdit={handleEditBatch}
              onDelete={handleDeleteBatch}
              onAddStudent={handleAddStudentToBatch}
            />
          ))}
        </div>
      )}

      <BatchDeleteDialog
        batch={batchPendingDelete}
        enrolledCount={
          batchPendingDelete
            ? (enrollmentCounts.get(batchPendingDelete.id) ?? 0)
            : 0
        }
        onOpenChange={(open) => {
          if (!open) setBatchPendingDelete(null);
        }}
        onConfirm={handleConfirmDelete}
      />

      <AddStudentDialog
        config={
          addStudentTarget
            ? { defaultBatchId: addStudentTarget.id, lockBatch: true }
            : null
        }
        batches={batches}
        onOpenChange={(open) => {
          if (!open) setAddStudentTarget(null);
        }}
        onCreated={handleStudentCreated}
      />
    </PageContainer>
  );
}
