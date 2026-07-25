import type {
  Batch as PrismaBatch,
  BatchScheduleEntry as PrismaScheduleEntry,
  BatchStatus as PrismaBatchStatus,
  WeekDay as PrismaWeekDay,
} from "@prisma/client";
import type { Batch, BatchScheduleEntry, BatchStatus, WeekDay } from "@/types/batch";

const WEEK_DAY_TO_UI: Record<PrismaWeekDay, WeekDay> = {
  MON: "mon",
  TUE: "tue",
  WED: "wed",
  THU: "thu",
  FRI: "fri",
  SAT: "sat",
  SUN: "sun",
};

const WEEK_DAY_TO_PRISMA: Record<WeekDay, PrismaWeekDay> = {
  mon: "MON",
  tue: "TUE",
  wed: "WED",
  thu: "THU",
  fri: "FRI",
  sat: "SAT",
  sun: "SUN",
};

const BATCH_STATUS_TO_UI: Record<PrismaBatchStatus, BatchStatus> = {
  ACTIVE: "active",
  INACTIVE: "inactive",
};

const BATCH_STATUS_TO_PRISMA: Record<BatchStatus, PrismaBatchStatus> = {
  active: "ACTIVE",
  inactive: "INACTIVE",
};

export function weekDayToUI(day: PrismaWeekDay): WeekDay {
  return WEEK_DAY_TO_UI[day];
}

export function weekDayToPrisma(day: WeekDay): PrismaWeekDay {
  return WEEK_DAY_TO_PRISMA[day];
}

export function batchStatusToUI(status: PrismaBatchStatus): BatchStatus {
  return BATCH_STATUS_TO_UI[status];
}

export function batchStatusToPrisma(status: BatchStatus): PrismaBatchStatus {
  return BATCH_STATUS_TO_PRISMA[status];
}

export function mapScheduleEntry(
  entry: PrismaScheduleEntry,
): BatchScheduleEntry {
  return {
    day: weekDayToUI(entry.day),
    startTime: entry.startTime,
    endTime: entry.endTime,
  };
}

type BatchRow = PrismaBatch & {
  schedule: PrismaScheduleEntry[];
  teacher: { fullName: string | null };
};

export function mapBatch(row: BatchRow): Batch {
  return {
    id: row.id,
    name: row.name,
    subject: row.subject,
    teacherName: row.teacher.fullName ?? "",
    googleMeetLink: row.googleMeetLink ?? "",
    schedule: row.schedule.map(mapScheduleEntry),
    capacity: row.capacity,
    status: batchStatusToUI(row.status),
    createdAt: row.createdAt.toISOString(),
  };
}
