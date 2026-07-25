// lib/mock/batch.ts

import type {
  Batch,
  BatchFormData,
  BatchScheduleEntry,
  BatchStatsData,
  BatchWithRoster,
  WeekDay,
} from "@/types/batch";
import { mockStudents } from "@/lib/mock/student";
import type { Student } from "@/types/student";
import { USE_DEMO_DATA } from "@/lib/config";

const DEMO_BATCHES: Batch[] = [
  {
    id: "batch-a",
    name: "Batch A",
    subject: "Mathematics",
    teacherName: "Mrs. Kavita Sharma",
    googleMeetLink: "https://meet.google.com/abc-defg-hij",
    // Different time on each day — this is the common case in practice.
    schedule: [
      { day: "mon", startTime: "16:00", endTime: "17:30" },
      { day: "wed", startTime: "18:00", endTime: "19:00" },
      { day: "fri", startTime: "17:00", endTime: "18:30" },
    ],
    capacity: 20,
    status: "active",
    createdAt: "2025-05-01T09:00:00.000Z",
  },
  {
    id: "batch-b",
    name: "Batch B",
    subject: "Physics",
    teacherName: "Mr. Anil Verma",
    googleMeetLink: "https://meet.google.com/klm-nopq-rst",
    schedule: [
      { day: "tue", startTime: "17:00", endTime: "18:30" },
      { day: "thu", startTime: "17:00", endTime: "18:30" },
    ],
    capacity: 18,
    status: "active",
    createdAt: "2025-05-02T09:00:00.000Z",
  },
  {
    id: "batch-c",
    name: "Batch C",
    subject: "Chemistry",
    teacherName: "Mrs. Lakshmi Iyer",
    googleMeetLink: "https://meet.google.com/uvw-xyz1-234",
    schedule: [
      { day: "mon", startTime: "18:00", endTime: "19:30" },
      { day: "fri", startTime: "18:00", endTime: "19:30" },
    ],
    capacity: 15,
    status: "active",
    createdAt: "2025-05-03T09:00:00.000Z",
  },
  {
    id: "batch-d",
    name: "Batch D",
    subject: "Biology",
    teacherName: "Mr. Suresh Nair",
    googleMeetLink: "https://meet.google.com/567-89ab-cde",
    schedule: [{ day: "sat", startTime: "10:00", endTime: "12:00" }],
    capacity: 25,
    status: "inactive",
    createdAt: "2025-05-04T09:00:00.000Z",
  },
];

// A first-time user has created nothing yet — only seed demo data when the
// feature flag is on (see lib/config.ts).
export const mockBatches: Batch[] = USE_DEMO_DATA ? DEMO_BATCHES : [];

const WEEKDAY_LABELS: Record<WeekDay, string> = {
  mon: "Mon",
  tue: "Tue",
  wed: "Wed",
  thu: "Thu",
  fri: "Fri",
  sat: "Sat",
  sun: "Sun",
};

const WEEKDAY_ORDER: Record<WeekDay, number> = {
  mon: 0,
  tue: 1,
  wed: 2,
  thu: 3,
  fri: 4,
  sat: 5,
  sun: 6,
};

export function formatBatchTime(time: string): string {
  const [hoursStr, minutesStr] = time.split(":");
  const hours = Number(hoursStr);
  const minutes = Number(minutesStr);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return time;

  const period = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  return `${hour12}:${minutesStr.padStart(2, "0")} ${period}`;
}

// Renders as a single shared time range when every day meets at the same
// time (the common case), and expands to one segment per day when times
// differ across the week.
export function formatBatchSchedule(schedule: BatchScheduleEntry[]): string {
  if (schedule.length === 0) return "No schedule set";

  const sorted = [...schedule].sort(
    (a, b) => WEEKDAY_ORDER[a.day] - WEEKDAY_ORDER[b.day],
  );

  const sameTimeEveryDay = sorted.every(
    (entry) =>
      entry.startTime === sorted[0].startTime &&
      entry.endTime === sorted[0].endTime,
  );

  if (sameTimeEveryDay) {
    const days = sorted.map((entry) => WEEKDAY_LABELS[entry.day]).join(", ");
    return `${days} · ${formatBatchTime(sorted[0].startTime)} - ${formatBatchTime(sorted[0].endTime)}`;
  }

  return sorted
    .map(
      (entry) =>
        `${WEEKDAY_LABELS[entry.day]} ${formatBatchTime(entry.startTime)}-${formatBatchTime(entry.endTime)}`,
    )
    .join(", ");
}

export function getScheduleEntryForDay(
  batch: Batch,
  day: WeekDay,
): BatchScheduleEntry | undefined {
  return batch.schedule.find((entry) => entry.day === day);
}

export function batchMeetsOnDay(batch: Batch, day: WeekDay): boolean {
  return batch.schedule.some((entry) => entry.day === day);
}

export function getBatchById(id: string): Batch | undefined {
  return mockBatches.find((batch) => batch.id === id);
}

export function getStudentsByBatch(batchId: string): Student[] {
  return mockStudents.filter((student) => student.batchId === batchId);
}

export function getBatchWithRoster(id: string): BatchWithRoster | undefined {
  const batch = getBatchById(id);
  if (!batch) return undefined;

  const students = getStudentsByBatch(id);

  return {
    ...batch,
    students,
    enrolledCount: students.length,
    capacityPercentage:
      batch.capacity > 0
        ? Math.round((students.length / batch.capacity) * 100)
        : 0,
  };
}

export function computeBatchStats(batches: Batch[]): BatchStatsData {
  const activeBatches = batches.filter((batch) => batch.status === "active");
  const totalEnrolled = batches.reduce(
    (sum, batch) => sum + getStudentsByBatch(batch.id).length,
    0,
  );
  // Batches with no capacity set have nothing to measure usage against —
  // excluded rather than counted as 0%, which would skew the average down.
  const capacityUsages = activeBatches
    .filter((batch) => batch.capacity > 0)
    .map((batch) => {
      const enrolled = getStudentsByBatch(batch.id).length;
      return (enrolled / batch.capacity) * 100;
    });

  return {
    totalBatches: batches.length,
    activeBatches: activeBatches.length,
    totalEnrolled,
    averageCapacityUsage:
      capacityUsages.length === 0
        ? 0
        : Math.round(
            capacityUsages.reduce((sum, value) => sum + value, 0) /
              capacityUsages.length,
          ),
  };
}

// teacherName comes from the signed-in teacher's Settings profile, not the
// batch form — see the "Teacher" field removal in BatchForm.
export function createBatch(data: BatchFormData, teacherName: string): Batch {
  const batch: Batch = {
    id: `batch-${crypto.randomUUID()}`,
    ...data,
    teacherName,
    createdAt: new Date().toISOString(),
  };

  mockBatches.unshift(batch);
  return batch;
}

export function updateBatch(
  id: string,
  data: BatchFormData,
  teacherName: string,
): Batch | null {
  const index = mockBatches.findIndex((batch) => batch.id === id);
  if (index === -1) return null;

  const updated: Batch = {
    ...mockBatches[index],
    ...data,
    teacherName,
  };
  mockBatches[index] = updated;

  mockStudents.forEach((student, studentIndex) => {
    if (student.batchId === id && student.batchName !== updated.name) {
      mockStudents[studentIndex] = { ...student, batchName: updated.name };
    }
  });

  return updated;
}

export function canDeleteBatch(id: string): boolean {
  return getStudentsByBatch(id).length === 0;
}

export function deleteBatch(id: string): boolean {
  if (!canDeleteBatch(id)) return false;

  const index = mockBatches.findIndex((batch) => batch.id === id);
  if (index === -1) return false;

  mockBatches.splice(index, 1);
  return true;
}

export function assignStudentToBatch(
  studentId: string,
  batchId: string,
): Student | null {
  const batch = getBatchById(batchId);
  if (!batch) return null;

  const index = mockStudents.findIndex((student) => student.id === studentId);
  if (index === -1) return null;

  const updated: Student = {
    ...mockStudents[index],
    batchId: batch.id,
    batchName: batch.name,
  };
  mockStudents[index] = updated;
  return updated;
}

export function removeStudentFromBatch(studentId: string): Student | null {
  const index = mockStudents.findIndex((student) => student.id === studentId);
  if (index === -1) return null;

  const updated: Student = {
    ...mockStudents[index],
    batchId: "",
    batchName: "Unassigned",
  };
  mockStudents[index] = updated;
  return updated;
}
