import { redirect } from "next/navigation";
import { getCurrentTeacher } from "@/server/auth/get-current-teacher";
import { getStudentById } from "@/server/students/queries";
import { getAllBatches } from "@/server/batches/queries";
import EditStudentFormClient from "@/components/students/EditStudentFormClient";

export default async function EditStudentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const teacher = await getCurrentTeacher();
  if (!teacher) {
    redirect("/auth/login");
  }

  const [student, batches] = await Promise.all([
    getStudentById(teacher.id, id),
    getAllBatches(teacher.id),
  ]);

  return (
    <EditStudentFormClient studentId={id} student={student} batches={batches} />
  );
}
