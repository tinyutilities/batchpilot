import { redirect } from "next/navigation";
import { getCurrentTeacher } from "@/server/auth/get-current-teacher";
import { getAllStudents } from "@/server/students/queries";
import { getAllBatches } from "@/server/batches/queries";
import StudentsPageClient from "@/components/students/StudentsPageClient";

export default async function StudentsPage() {
  const teacher = await getCurrentTeacher();
  if (!teacher) {
    redirect("/auth/login");
  }

  const [students, batches] = await Promise.all([
    getAllStudents(teacher.id),
    getAllBatches(teacher.id),
  ]);

  return <StudentsPageClient initialStudents={students} batches={batches} />;
}
