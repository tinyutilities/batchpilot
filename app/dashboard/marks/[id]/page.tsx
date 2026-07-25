import { redirect } from "next/navigation";
import { getCurrentTeacher } from "@/server/auth/get-current-teacher";
import {
  getMarksByTest,
  getTestById,
  getTestResultSummary,
} from "@/server/marks/queries";
import { getStudentsByBatch } from "@/server/batches/queries";
import TestDetailPageClient from "@/components/marks/TestDetailPageClient";
import type { MarkStatus } from "@/types/marks";

export default async function TestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const teacher = await getCurrentTeacher();
  if (!teacher) {
    redirect("/auth/login");
  }

  const [test, summary] = await Promise.all([
    getTestById(teacher.id, id),
    getTestResultSummary(teacher.id, id),
  ]);

  const [roster, marks] = await Promise.all([
    test ? getStudentsByBatch(teacher.id, test.batchId) : Promise.resolve([]),
    getMarksByTest(teacher.id, id),
  ]);

  const initialMarksMap: Record<string, { marksObtained: number; status: MarkStatus }> = {};
  marks.forEach((mark) => {
    initialMarksMap[mark.studentId] = {
      marksObtained: mark.marksObtained,
      status: mark.status,
    };
  });

  return (
    <TestDetailPageClient
      testId={id}
      initialTest={test}
      initialSummary={summary}
      roster={roster}
      initialMarksMap={initialMarksMap}
    />
  );
}
