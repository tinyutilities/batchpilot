import { Suspense } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { redirect } from "next/navigation";
import { getCurrentTeacher } from "@/server/auth/get-current-teacher";
import {
  getAllMarks,
  getAllTests,
  getAllTestResultSummaries,
} from "@/server/marks/queries";
import { getAllBatches } from "@/server/batches/queries";
import { prisma } from "@/server/db/prisma";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { PageBodySkeleton } from "@/components/layout/page-skeleton";
import { Button } from "@/components/ui/button";
import MarksPageClient from "@/components/marks/MarksPageClient";

// The header is static (title/description) plus a plain navigation Link —
// nothing here depends on the queries below, so it renders immediately
// instead of waiting on them like the old single-component page did. Only
// the data-dependent body streams in behind Suspense.
async function MarksBody({ teacherId }: { teacherId: string }) {
  const [allSummaries, allTests, allMarks, batches, students] = await Promise.all([
    getAllTestResultSummaries(teacherId),
    getAllTests(teacherId),
    getAllMarks(teacherId),
    getAllBatches(teacherId),
    prisma.student.findMany({
      where: { teacherId },
      select: { id: true, firstName: true, lastName: true },
    }),
  ]);

  const studentNameById: Record<string, string> = {};
  students.forEach((s) => {
    studentNameById[s.id] = `${s.firstName} ${s.lastName}`.trim();
  });

  return (
    <MarksPageClient
      allSummaries={allSummaries}
      allTests={allTests}
      allMarks={allMarks}
      studentNameById={studentNameById}
      batches={batches}
    />
  );
}

export default async function MarksPage() {
  const teacher = await getCurrentTeacher();
  if (!teacher) {
    redirect("/auth/login");
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

      <Suspense fallback={<PageBodySkeleton statCards={4} rows={6} />}>
        <MarksBody teacherId={teacher.id} />
      </Suspense>
    </PageContainer>
  );
}
