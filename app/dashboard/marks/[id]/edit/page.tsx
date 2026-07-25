import { redirect } from "next/navigation";
import { getCurrentTeacher } from "@/server/auth/get-current-teacher";
import { getTestById } from "@/server/marks/queries";
import { getAllBatches } from "@/server/batches/queries";
import EditTestFormClient from "@/components/marks/EditTestFormClient";

export default async function EditTestPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const teacher = await getCurrentTeacher();
  if (!teacher) {
    redirect("/auth/login");
  }

  const [test, batches] = await Promise.all([
    getTestById(teacher.id, id),
    getAllBatches(teacher.id),
  ]);

  return <EditTestFormClient testId={id} test={test} batches={batches} />;
}
