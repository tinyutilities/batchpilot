import type {
  Batch,
  BatchScheduleEntry,
  BatchStatsData,
  WeekDay,
} from "@/types/batch";

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

// Enrollment counts are computed server-side (Prisma aggregate) and passed
// in, since the client no longer has the full student array to scan.
export function computeBatchStats(
  batches: Batch[],
  enrollmentCounts: Map<string, number>,
): BatchStatsData {
  const activeBatches = batches.filter((batch) => batch.status === "active");
  const totalEnrolled = batches.reduce(
    (sum, batch) => sum + (enrollmentCounts.get(batch.id) ?? 0),
    0,
  );
  // Batches with no capacity set have nothing to measure usage against —
  // excluded rather than counted as 0%, which would skew the average down.
  const capacityUsages = activeBatches
    .filter((batch) => batch.capacity > 0)
    .map((batch) => {
      const enrolled = enrollmentCounts.get(batch.id) ?? 0;
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
