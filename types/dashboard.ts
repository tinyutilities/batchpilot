// types/dashboard.ts

export interface DashboardStatsData {
  totalStudents: number;
  activeBatches: number;
  todaysClasses: number;
  attendanceTodayPercentage: number;
  attendanceTodayMarked: number;
  attendanceTodayTotal: number;
  monthlyCollection: number;
  pendingFees: number;
  testsThisMonth: number;
  averageMarksPercentage: number;
}

export interface ScheduleEntry {
  batchId: string;
  batchName: string;
  subject: string;
  teacherName: string;
  timeLabel: string;
  googleMeetLink: string;
  isMarked: boolean;
}

export type ActivityType =
  | "student_added"
  | "attendance_marked"
  | "payment_recorded"
  | "test_created"
  | "marks_entered";

export interface ActivityItem {
  id: string;
  type: ActivityType;
  at: string;
  title: string;
  description?: string;
}

export interface TrendPoint {
  label: string;
  percentage: number;
}

export interface DashboardTrends {
  attendance: TrendPoint[];
  feeCollection: TrendPoint[];
  marks: TrendPoint[];
}
