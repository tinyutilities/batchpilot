import { redirect } from "next/navigation";
import { getCurrentTeacher } from "@/server/auth/get-current-teacher";
import { getBatchById } from "@/server/batches/queries";
import EditBatchFormClient from "@/components/batches/EditBatchFormClient";

export default async function EditBatchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const teacher = await getCurrentTeacher();
  if (!teacher) {
    redirect("/auth/login");
  }

  const batch = await getBatchById(teacher.id, id);

  return <EditBatchFormClient batchId={id} batch={batch} />;
}
