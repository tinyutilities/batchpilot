import { redirect } from "next/navigation";
import { getCurrentTeacher } from "@/server/auth/get-current-teacher";
import { getAllFees } from "@/server/fees/queries";
import { getAllBatches } from "@/server/batches/queries";
import { prisma } from "@/server/db/prisma";
import FeesPageClient from "@/components/fees/FeesPageClient";
import type { FeeTableRow } from "@/types/fees";

export default async function FeesPage() {
  const teacher = await getCurrentTeacher();
  if (!teacher) {
    redirect("/auth/login");
  }

  const [fees, batches, students] = await Promise.all([
    getAllFees(teacher.id),
    getAllBatches(teacher.id),
    prisma.student.findMany({
      where: { teacherId: teacher.id },
      select: { id: true, firstName: true, lastName: true },
    }),
  ]);

  const studentNameById = new Map(
    students.map((s) => [s.id, `${s.firstName} ${s.lastName}`.trim()]),
  );
  const batchNameById = new Map(batches.map((b) => [b.id, b.name]));

  const rows: FeeTableRow[] = fees.map((fee) => ({
    fee,
    studentId: fee.studentId,
    studentName: studentNameById.get(fee.studentId) ?? "Unknown Student",
    batchName: batchNameById.get(fee.batchId) ?? "Unknown Batch",
  }));

  return (
    <FeesPageClient
      initialRows={rows}
      batches={batches}
      hasAnyStudents={students.length > 0}
    />
  );
}
