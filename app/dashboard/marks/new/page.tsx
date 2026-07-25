import { redirect } from "next/navigation";
import { getCurrentTeacher } from "@/server/auth/get-current-teacher";
import { getAllBatches } from "@/server/batches/queries";
import NewTestFormClient from "@/components/marks/NewTestFormClient";

export default async function NewTestPage() {
  const teacher = await getCurrentTeacher();
  if (!teacher) {
    redirect("/auth/login");
  }

  const batches = await getAllBatches(teacher.id);

  return <NewTestFormClient batches={batches} />;
}
