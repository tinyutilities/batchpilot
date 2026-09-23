import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getCurrentTeacher } from "@/server/auth/get-current-teacher";
import { getAllFees } from "@/server/fees/queries";
import { getAllBatches } from "@/server/batches/queries";
import { prisma } from "@/server/db/prisma";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { PageBodySkeleton } from "@/components/layout/page-skeleton";
import FeesPageClient from "@/components/fees/FeesPageClient";
import type { FeeTableRow } from "@/types/fees";

// The header is static — nothing here depends on `fees`/`batches`/
// `students`, so it renders immediately instead of waiting on the queries
// below like the old single-component page did. Only the data-dependent
// body streams in behind Suspense.
async function FeesBody({ teacherId }: { teacherId: string }) {
  const [fees, batches, students] = await Promise.all([
    getAllFees(teacherId),
    getAllBatches(teacherId),
    prisma.student.findMany({
      where: { teacherId },
      select: { id: true, firstName: true, lastName: true },
    }),
  ]);

  const studentNameById = new Map(
    students.map((s) => [s.id, `${s.firstName} ${s.lastName}`.trim()]),
  );
  const batchNameById = new Map(batches.map((b) => [b.id, b.name]));

  const rows: FeeTableRow[] = fees.map((fee) => ({
    fee,
    studentId: fee.studentId,
    studentName: studentNameById.get(fee.studentId) ?? "Unknown Student",
    batchName: batchNameById.get(fee.batchId) ?? "Unknown Batch",
  }));

  return (
    <FeesPageClient
      initialRows={rows}
      batches={batches}
      hasAnyStudents={students.length > 0}
    />
  );
}

export default async function FeesPage() {
  const teacher = await getCurrentTeacher();
  if (!teacher) {
    redirect("/auth/login");
  }

  return (
    <PageContainer>
      <PageHeader
        title="Fees"
        description="Track fee payments, pending dues, and payment history."
      />

      <Suspense fallback={<PageBodySkeleton statCards={4} rows={6} />}>
        <FeesBody teacherId={teacher.id} />
      </Suspense>
    </PageContainer>
  );
}
