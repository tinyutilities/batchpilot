import type { Student, StudentStatsData } from "@/types/student";

export function computeStudentStats(students: Student[]): StudentStatsData {
  return {
    totalStudents: students.length,
    activeStudents: students.filter((s) => s.status === "active").length,
    averageAttendance:
      students.length === 0
        ? 0
        : Math.round(
            students.reduce((sum, s) => sum + s.attendancePercentage, 0) /
              students.length,
          ),
    pendingFeesAmount: students.reduce((sum, s) => sum + s.pendingFees, 0),
    pendingFeesCount: students.filter((s) => s.pendingFees > 0).length,
  };
}
