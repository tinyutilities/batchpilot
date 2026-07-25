import { redirect } from "next/navigation";
import { getCurrentTeacher } from "@/server/auth/get-current-teacher";
import { getStudentById } from "@/server/students/queries";
import {
  getAttendanceByStudent,
  getStudentAttendanceSummary,
} from "@/server/attendance/queries";
import { getStudentFeeSummary } from "@/server/fees/queries";
import { getStudentMarkSummary } from "@/server/marks/queries";
import StudentDetailPageClient from "@/components/students/StudentDetailPageClient";

export default async function StudentProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const teacher = await getCurrentTeacher();
  if (!teacher) {
    redirect("/auth/login");
  }

  const [student, attendanceRecords, attendanceSummary, feeSummary, marksSummary] =
    await Promise.all([
      getStudentById(teacher.id, id),
      getAttendanceByStudent(teacher.id, id),
      getStudentAttendanceSummary(teacher.id, id),
      getStudentFeeSummary(teacher.id, id),
      getStudentMarkSummary(teacher.id, id),
    ]);

  return (
    <StudentDetailPageClient
      studentId={id}
      student={student}
      attendanceRecords={attendanceRecords}
      attendanceSummary={attendanceSummary}
      feeSummary={feeSummary}
      marksSummary={marksSummary}
    />
  );
}
