import type {
  Student as PrismaStudent,
  Gender as PrismaGender,
  StudentStatus as PrismaStudentStatus,
} from "@prisma/client";
import type { Gender, Student, StudentStatus } from "@/types/student";

const GENDER_TO_UI: Record<PrismaGender, Gender> = {
  MALE: "male",
  FEMALE: "female",
  OTHER: "other",
};

const GENDER_TO_PRISMA: Record<Gender, PrismaGender> = {
  male: "MALE",
  female: "FEMALE",
  other: "OTHER",
};

const STATUS_TO_UI: Record<PrismaStudentStatus, StudentStatus> = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  ARCHIVED: "archived",
};

const STATUS_TO_PRISMA: Record<StudentStatus, PrismaStudentStatus> = {
  active: "ACTIVE",
  inactive: "INACTIVE",
  archived: "ARCHIVED",
};

export function genderToUI(gender: PrismaGender): Gender {
  return GENDER_TO_UI[gender];
}

export function genderToPrisma(gender: Gender): PrismaGender {
  return GENDER_TO_PRISMA[gender];
}

export function studentStatusToUI(status: PrismaStudentStatus): StudentStatus {
  return STATUS_TO_UI[status];
}

export function studentStatusToPrisma(status: StudentStatus): PrismaStudentStatus {
  return STATUS_TO_PRISMA[status];
}

interface StudentExtras {
  batchName: string;
  attendancePercentage: number;
  pendingFees: number;
}

export function mapStudent(row: PrismaStudent, extras: StudentExtras): Student {
  return {
    id: row.id,
    firstName: row.firstName,
    lastName: row.lastName,
    fullName: `${row.firstName} ${row.lastName}`.trim(),
    email: row.email,
    phone: row.phone ?? "",
    gender: genderToUI(row.gender),
    dateOfBirth: row.dateOfBirth ? row.dateOfBirth.toISOString().slice(0, 10) : "",
    guardianName: row.guardianName,
    guardianPhone: row.guardianPhone,
    address: row.address,
    batchId: row.batchId ?? "",
    batchName: extras.batchName,
    school: row.school ?? "",
    status: studentStatusToUI(row.status),
    notes: row.notes ?? "",
    attendancePercentage: extras.attendancePercentage,
    pendingFees: extras.pendingFees,
    avatar: row.avatar ?? undefined,
    createdAt: row.createdAt.toISOString(),
  };
}
