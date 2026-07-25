// lib/mock/dashboard.ts

import {
  computeBatchStats,
  formatBatchTime,
  getBatchById,
  getScheduleEntryForDay,
  getStudentsByBatch,
  mockBatches,
} from "@/lib/mock/batch";
import {
  computeStudentStats,
  getStudentById,
  mockStudents,
} from "@/lib/mock/student";
import {
  computeAttendanceStats,
  getAllAttendanceSessions,
  getMonthlyAttendanceStats,
  getScheduledBatchesForDate,
  getWeekDayForDateKey,
  isAttendanceMarkedForBatch,
  toDateKey,
} from "@/lib/mock/attendance";
import {
  computeFeeStats,
  getAllFees,
  getMonthlyCollectionStats,
  mockPayments,
  monthLabel,
} from "@/lib/mock/fees";
import {
  computeMarksStats,
  getAllTests,
  getMarkEntrySessions,
  getMonthlyTestSummaries,
  getTestById,
} from "@/lib/mock/marks";
import type {
  ActivityItem,
  DashboardStatsData,
  DashboardTrends,
  ScheduleEntry,
} from "@/types/dashboard";

function currentMonthKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export function getTimeOfDayGreeting(
  hour: number = new Date().getHours(),
): string {
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}

export function getDashboardStats(): DashboardStatsData {
  const today = toDateKey(new Date());
  const thisMonth = currentMonthKey();

  const studentStats = computeStudentStats(mockStudents);
  const batchStats = computeBatchStats(mockBatches);
  const todaysBatches = getScheduledBatchesForDate(today);

  const todayRecords = getAllAttendanceSessions()
    .filter((session) => session.date === today)
    .flatMap((session) => session.records);
  const todayAttendanceStats = computeAttendanceStats(todayRecords);

  const monthCollection = getMonthlyCollectionStats(1)[0];
  const pendingFeesThisMonth = computeFeeStats(
    getAllFees().filter((fee) => fee.month === thisMonth),
  );

  const testsThisMonth = getMonthlyTestSummaries(1)[0];
  const marksStats = computeMarksStats(getAllTests());

  return {
    totalStudents: studentStats.totalStudents,
    activeBatches: batchStats.activeBatches,
    todaysClasses: todaysBatches.length,
    attendanceTodayPercentage: todayAttendanceStats.averageAttendancePercentage,
    attendanceTodayMarked: todayRecords.length,
    attendanceTodayTotal: todaysBatches.reduce(
      (sum, batch) => sum + getStudentsByBatch(batch.id).length,
      0,
    ),
    monthlyCollection: monthCollection?.collected ?? 0,
    pendingFees: pendingFeesThisMonth.pendingAmount,
    testsThisMonth: testsThisMonth?.testsCount ?? 0,
    averageMarksPercentage: marksStats.averagePercentage,
  };
}

export function getTodaySchedule(): ScheduleEntry[] {
  const today = toDateKey(new Date());
  const weekDay = getWeekDayForDateKey(today);

  return getScheduledBatchesForDate(today)
    .map((batch) => ({
      batch,
      // getScheduledBatchesForDate already filtered to batches meeting
      // today, so a matching entry is guaranteed here.
      entry: getScheduleEntryForDay(batch, weekDay)!,
    }))
    .sort((a, b) => (a.entry.startTime < b.entry.startTime ? -1 : 1))
    .map(({ batch, entry }) => ({
      batchId: batch.id,
      batchName: batch.name,
      subject: batch.subject,
      teacherName: batch.teacherName,
      timeLabel: `${formatBatchTime(entry.startTime)} - ${formatBatchTime(entry.endTime)}`,
      googleMeetLink: batch.googleMeetLink,
      isMarked: isAttendanceMarkedForBatch(batch.id, today),
    }));
}

export function getRecentActivity(limit = 8): ActivityItem[] {
  const items: ActivityItem[] = [];

  mockStudents.forEach((student) => {
    items.push({
      id: `student-${student.id}`,
      type: "student_added",
      at: student.createdAt,
      title: `${student.fullName} was added as a new student`,
      description: student.batchName,
    });
  });

  getAllAttendanceSessions().forEach((session) => {
    const markedAt =
      session.records[0]?.markedAt ?? `${session.date}T00:00:00.000Z`;
    items.push({
      id: `attendance-${session.batchId}-${session.date}`,
      type: "attendance_marked",
      at: markedAt,
      title: `Attendance marked for ${session.batchName}`,
      description: `${session.presentCount} present, ${session.absentCount} absent of ${session.totalStudents}`,
    });
  });

  mockPayments.forEach((payment) => {
    const student = getStudentById(payment.studentId);
    items.push({
      id: `payment-${payment.id}`,
      type: "payment_recorded",
      at: payment.createdAt,
      title: `Payment of ₹${payment.amount.toLocaleString("en-IN")} recorded`,
      description: student?.fullName,
    });
  });

  getAllTests().forEach((test) => {
    const batch = getBatchById(test.batchId);
    items.push({
      id: `test-${test.id}`,
      type: "test_created",
      at: test.createdAt,
      title: `Test "${test.name}" created`,
      description: batch?.name,
    });
  });

  getMarkEntrySessions().forEach((session) => {
    const test = getTestById(session.testId);
    items.push({
      id: `marks-${session.testId}-${session.createdAt}`,
      type: "marks_entered",
      at: session.createdAt,
      title: `Marks entered for ${test?.name ?? "a test"}`,
      description: `${session.count} student${session.count === 1 ? "" : "s"} scored`,
    });
  });

  return items.sort((a, b) => (a.at < b.at ? 1 : -1)).slice(0, limit);
}

export function getDashboardTrends(monthsBack = 6): DashboardTrends {
  return {
    attendance: getMonthlyAttendanceStats(monthsBack).map((point) => ({
      label: monthLabel(point.month),
      percentage: point.averagePercentage,
    })),
    feeCollection: getMonthlyCollectionStats(monthsBack).map((point) => ({
      label: monthLabel(point.month),
      percentage: point.collectionRate,
    })),
    marks: getMonthlyTestSummaries(monthsBack).map((point) => ({
      label: monthLabel(point.month),
      percentage: point.averagePercentage,
    })),
  };
}
