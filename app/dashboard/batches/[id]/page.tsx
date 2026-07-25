import { redirect } from "next/navigation";
import { getCurrentTeacher } from "@/server/auth/get-current-teacher";
import { getBatchWithRoster } from "@/server/batches/queries";
import { getAllStudents } from "@/server/students/queries";
import BatchDetailPageClient from "@/components/batches/BatchDetailPageClient";

export default async function BatchDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const teacher = await getCurrentTeacher();
  if (!teacher) {
    redirect("/auth/login");
  }

  const [batch, allStudents] = await Promise.all([
    getBatchWithRoster(teacher.id, id),
    getAllStudents(teacher.id),
  ]);

  return (
    <BatchDetailPageClient
      batchId={id}
      initialBatch={batch}
      initialAllStudents={allStudents}
    />
  );
}
