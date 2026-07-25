import { redirect } from "next/navigation";
import { getCurrentTeacher } from "@/server/auth/get-current-teacher";
import { getAllBatches, getStudentsByBatch } from "@/server/batches/queries";
import { getAttendanceForBatchOnDate } from "@/server/attendance/queries";
import { toDateKey } from "@/lib/utils";
import MarkAttendancePageClient from "@/components/attendance/MarkAttendancePageClient";
import type { AttendanceStatus } from "@/types/attendance";

export default async function MarkAttendancePage({
  searchParams,
}: {
  searchParams: Promise<{ batchId?: string; date?: string }>;
}) {
  const { batchId, date } = await searchParams;

  const teacher = await getCurrentTeacher();
  if (!teacher) {
    redirect("/auth/login");
  }

  const resolvedBatchId = batchId ?? "";
  const resolvedDate = date ?? toDateKey(new Date());

  const [batches, students, records] = await Promise.all([
    getAllBatches(teacher.id),
    resolvedBatchId ? getStudentsByBatch(teacher.id, resolvedBatchId) : Promise.resolve([]),
    resolvedBatchId
      ? getAttendanceForBatchOnDate(teacher.id, resolvedBatchId, resolvedDate)
      : Promise.resolve([]),
  ]);

  const initialStatuses: Record<string, AttendanceStatus> = {};
  records.forEach((record) => {
    initialStatuses[record.studentId] = record.status;
  });

  return (
    <MarkAttendancePageClient
      batches={batches}
      initialBatchId={resolvedBatchId}
      initialDate={resolvedDate}
      initialStudents={students}
      initialStatuses={initialStatuses}
    />
  );
}
