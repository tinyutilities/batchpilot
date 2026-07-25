import { redirect } from "next/navigation";
import { getCurrentTeacher } from "@/server/auth/get-current-teacher";
import { getAllBatches } from "@/server/batches/queries";
import NewStudentFormClient from "@/components/students/NewStudentFormClient";

export default async function AddStudentPage() {
  const teacher = await getCurrentTeacher();
  if (!teacher) {
    redirect("/auth/login");
  }

  const batches = await getAllBatches(teacher.id);

  return <NewStudentFormClient batches={batches} />;
}
