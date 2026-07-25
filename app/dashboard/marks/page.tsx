import { redirect } from "next/navigation";
import { getCurrentTeacher } from "@/server/auth/get-current-teacher";
import {
  getAllMarks,
  getAllTests,
  getAllTestResultSummaries,
} from "@/server/marks/queries";
import { getAllBatches } from "@/server/batches/queries";
import { prisma } from "@/server/db/prisma";
import MarksPageClient from "@/components/marks/MarksPageClient";

export default async function MarksPage() {
  const teacher = await getCurrentTeacher();
  if (!teacher) {
    redirect("/auth/login");
  }

  const [allSummaries, allTests, allMarks, batches, students] = await Promise.all([
    getAllTestResultSummaries(teacher.id),
    getAllTests(teacher.id),
    getAllMarks(teacher.id),
    getAllBatches(teacher.id),
    prisma.student.findMany({
      where: { teacherId: teacher.id },
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
