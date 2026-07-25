// types/batch.ts

import type { Student } from "./student";

export type BatchStatus = "active" | "inactive";

export type WeekDay = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

// One meeting slot for a single day of the week — a batch can meet on
// different days at different times (e.g. Monday 4-5:30pm, Wednesday
// 6-7pm), so schedule is a list of these rather than one shared time.
export interface BatchScheduleEntry {
  day: WeekDay;
  startTime: string;
  endTime: string;
}

export interface Batch {
  id: string;
  name: string;
  // Optional — many tuition teachers only teach one subject, so the batch
  // name alone (e.g. "Morning Batch") is often enough.
  subject: string;
  // Auto-filled from the teacher's Settings profile, not user-entered.
  // Stored per-batch (rather than looked up live) so existing demo data
  // and the admin section's per-teacher grouping keep working unchanged;
  // becomes meaningful once multiple teachers are supported.
  teacherName: string;
  googleMeetLink: string;
  schedule: BatchScheduleEntry[];
  // 0 means no limit set ("Unlimited") — capacity is optional at creation.
  capacity: number;
  status: BatchStatus;
  createdAt: string;
}

export interface BatchWithRoster extends Batch {
  students: Student[];
  enrolledCount: number;
  capacityPercentage: number;
}

export interface BatchStatsData {
  totalBatches: number;
  activeBatches: number;
  totalEnrolled: number;
  averageCapacityUsage: number;
}

export interface BatchStatsProps {
  stats: BatchStatsData;
}

export interface BatchFormData {
  name: string;
  subject: string;
  googleMeetLink: string;
  schedule: BatchScheduleEntry[];
  capacity: number;
  status: BatchStatus;
}

export type BatchSortOption =
  | "name-asc"
  | "name-desc"
  | "enrolled-desc"
  | "enrolled-asc"
  | "capacity-desc"
  | "capacity-asc"
  | "newest"
  | "oldest";

export interface BatchFilter {
  search: string;
  subject: string | "all";
  status: BatchStatus | "all";
}
