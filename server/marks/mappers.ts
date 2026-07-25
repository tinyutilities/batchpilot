import type {
  Exam as PrismaExam,
  Mark as PrismaMark,
  MarkStatus as PrismaMarkStatus,
} from "@prisma/client";
import type { MarkRecord, MarkStatus, Test } from "@/types/marks";
import { toDateKey } from "@/lib/utils";

const STATUS_TO_UI: Record<PrismaMarkStatus, MarkStatus> = {
  PRESENT: "present",
  ABSENT: "absent",
};

const STATUS_TO_PRISMA: Record<MarkStatus, PrismaMarkStatus> = {
  present: "PRESENT",
  absent: "ABSENT",
};

export function markStatusToUI(status: PrismaMarkStatus): MarkStatus {
  return STATUS_TO_UI[status];
}

export function markStatusToPrisma(status: MarkStatus): PrismaMarkStatus {
  return STATUS_TO_PRISMA[status];
}

export function mapTest(row: PrismaExam): Test {
  return {
    id: row.id,
    name: row.name,
    subject: row.subject,
    batchId: row.batchId,
    maxMarks: row.maxMarks,
    testDate: toDateKey(row.testDate),
    remarks: row.remarks ?? undefined,
    createdAt: row.createdAt.toISOString(),
  };
}

export function mapMark(row: PrismaMark): MarkRecord {
  return {
    id: row.id,
    testId: row.examId,
    studentId: row.studentId,
    marksObtained: Number(row.marksObtained),
    status: markStatusToUI(row.status),
    remarks: row.remarks ?? undefined,
    createdAt: row.createdAt.toISOString(),
  };
}
