import type {
  Attendance as PrismaAttendance,
  AttendanceStatus as PrismaAttendanceStatus,
} from "@prisma/client";
import type { AttendanceRecord, AttendanceStatus } from "@/types/attendance";
import { toDateKey } from "@/lib/utils";

const STATUS_TO_UI: Record<PrismaAttendanceStatus, AttendanceStatus> = {
  PRESENT: "present",
  ABSENT: "absent",
  LATE: "late",
  EXCUSED: "excused",
};

const STATUS_TO_PRISMA: Record<AttendanceStatus, PrismaAttendanceStatus> = {
  present: "PRESENT",
  absent: "ABSENT",
  late: "LATE",
  excused: "EXCUSED",
};

export function attendanceStatusToUI(
  status: PrismaAttendanceStatus,
): AttendanceStatus {
  return STATUS_TO_UI[status];
}

export function attendanceStatusToPrisma(
  status: AttendanceStatus,
): PrismaAttendanceStatus {
  return STATUS_TO_PRISMA[status];
}

export function mapAttendanceRecord(row: PrismaAttendance): AttendanceRecord {
  return {
    id: row.id,
    studentId: row.studentId,
    batchId: row.batchId,
    date: toDateKey(row.date),
    status: attendanceStatusToUI(row.status),
    markedAt: row.markedAt.toISOString(),
  };
}
