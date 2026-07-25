import { redirect } from "next/navigation";
import { getCurrentTeacher } from "@/server/auth/get-current-teacher";
import { getAllBatches } from "@/server/batches/queries";
import { getStudentBatchAssignments } from "@/server/students/queries";
import BatchesPageClient from "@/components/batches/BatchesPageClient";

export default async function BatchesPage() {
  const teacher = await getCurrentTeacher();
  if (!teacher) {
    redirect("/auth/login");
  }

  const [batches, assignments] = await Promise.all([
    getAllBatches(teacher.id),
    getStudentBatchAssignments(teacher.id),
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
