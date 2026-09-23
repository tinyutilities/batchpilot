import { Suspense } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { redirect } from "next/navigation";
import { getCurrentTeacher } from "@/server/auth/get-current-teacher";
import { getAllBatches } from "@/server/batches/queries";
import { getStudentBatchAssignments } from "@/server/students/queries";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { PageBodySkeleton } from "@/components/layout/page-skeleton";
import { Button } from "@/components/ui/button";
import BatchesPageClient from "@/components/batches/BatchesPageClient";

// The header is static (title/description) plus a plain navigation Link —
// nothing here depends on `batches`/`assignments`, so it renders immediately
// instead of waiting on the query below like the old single-component page
// did. Only the data-dependent body streams in behind Suspense.
async function BatchesBody({ teacherId }: { teacherId: string }) {
  const [batches, assignments] = await Promise.all([
    getAllBatches(teacherId),
    getStudentBatchAssignments(teacherId),
  ]);

  const enrollmentCounts: Record<string, number> = {};
  for (const { batchId } of assignments) {
    if (!batchId) continue;
    enrollmentCounts[batchId] = (enrollmentCounts[batchId] ?? 0) + 1;
  }

  return (
    <BatchesPageClient
      initialBatches={batches}
      initialEnrollmentCounts={enrollmentCounts}
    />
  );
}

export default async function BatchesPage() {
  const teacher = await getCurrentTeacher();
  if (!teacher) {
    redirect("/auth/login");
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

      <Suspense fallback={<PageBodySkeleton statCards={4} rows={6} />}>
        <BatchesBody teacherId={teacher.id} />
      </Suspense>
    </PageContainer>
  );
}
