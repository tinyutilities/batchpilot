import { prisma } from "@/server/db/prisma";
import { getAllBatches } from "@/server/batches/queries";
import { getAllStudents } from "@/server/students/queries";
import {
  getAllAttendanceSessions,
  getMonthlyAttendanceStats,
  getScheduledBatchesForDate,
} from "@/server/attendance/queries";
import { getAllFees, getMonthlyCollectionStats } from "@/server/fees/queries";
import {
  getAllMarks,
  getAllTests,
  getMonthlyTestSummaries,
} from "@/server/marks/queries";
import { computeStudentStats } from "@/lib/calculations/student";
import { computeBatchStats, formatBatchTime, getScheduleEntryForDay } from "@/lib/calculations/batch";
import { computeAttendanceStats, getWeekDayForDateKey } from "@/lib/calculations/attendance";
import { computeFeeStats, monthLabel } from "@/lib/calculations/fees";
import { computeMarksStats } from "@/lib/calculations/marks";
import { toDateKey, toMonthKey } from "@/lib/utils";
import type {
  ActivityItem,
  DashboardStatsData,
  DashboardTrends,
  ScheduleEntry,
} from "@/types/dashboard";

export async function getDashboardStats(teacherId: string): Promise<DashboardStatsData> {
  const today = toDateKey(new Date());
  const thisMonth = toMonthKey(new Date());

  const [students, batches, todaysBatches, allSessions, allFees, allTests, allMarks, monthlyCollection] =
    await Promise.all([
      getAllStudents(teacherId),
      getAllBatches(teacherId),
      getScheduledBatchesForDate(teacherId, today),
      getAllAttendanceSessions(teacherId),
      getAllFees(teacherId),
      getAllTests(teacherId),
      getAllMarks(teacherId),
      getMonthlyCollectionStats(teacherId, 1),
    ]);

  const enrollmentCounts = new Map<string, number>();
  students.forEach((student) => {
    if (!student.batchId) return;
    enrollmentCounts.set(student.batchId, (enrollmentCounts.get(student.batchId) ?? 0) + 1);
  });

  const studentStats = computeStudentStats(students);
  const batchStats = computeBatchStats(batches, enrollmentCounts);

  const todayRecords = allSessions
    .filter((session) => session.date === today)
    .flatMap((session) => session.records);
  const todayAttendanceStats = computeAttendanceStats(todayRecords);

  const pendingFeesThisMonth = computeFeeStats(
    allFees.filter((fee) => fee.month === thisMonth),
  );

  const monthTests = allTests.filter(
    (test) => toMonthKey(new Date(test.testDate)) === thisMonth,
  );
  // Matches the previous behavior: the count is month-scoped, but the
  // average percentage is computed across all-time tests, not just this
  // month's — a wider sample is more representative for a single stat card.
  const marksStatsAll = computeMarksStats(allTests, allMarks);

  return {
    totalStudents: studentStats.totalStudents,
    activeBatches: batchStats.activeBatches,
    todaysClasses: todaysBatches.length,
    attendanceTodayPercentage: todayAttendanceStats.averageAttendancePercentage,
    attendanceTodayMarked: todayRecords.length,
    attendanceTodayTotal: todaysBatches.reduce(
      (sum, batch) => sum + (enrollmentCounts.get(batch.id) ?? 0),
      0,
    ),
    monthlyCollection: monthlyCollection[0]?.collected ?? 0,
    pendingFees: pendingFeesThisMonth.pendingAmount,
    testsThisMonth: monthTests.length,
    averageMarksPercentage: marksStatsAll.averagePercentage,
  };
}

export async function getTodaySchedule(teacherId: string): Promise<ScheduleEntry[]> {
  const today = toDateKey(new Date());
  const weekDay = getWeekDayForDateKey(today);

  const [todaysBatches, allSessions] = await Promise.all([
    getScheduledBatchesForDate(teacherId, today),
    getAllAttendanceSessions(teacherId),
  ]);
  const markedBatchIds = new Set(
    allSessions.filter((session) => session.date === today).map((session) => session.batchId),
  );

  return todaysBatches
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
      isMarked: markedBatchIds.has(batch.id),
    }));
}

export async function getRecentActivity(
  teacherId: string,
  limit = 8,
): Promise<ActivityItem[]> {
  const [students, sessions, payments, tests, allMarks, batches] = await Promise.all([
    getAllStudents(teacherId),
    getAllAttendanceSessions(teacherId),
    prisma.payment.findMany({ where: { teacherId } }),
    getAllTests(teacherId),
    getAllMarks(teacherId),
    getAllBatches(teacherId),
  ]);

  const batchNameById = new Map(batches.map((batch) => [batch.id, batch.name]));
  const studentNameById = new Map(students.map((student) => [student.id, student.fullName]));
  const testById = new Map(tests.map((test) => [test.id, test]));

  const items: ActivityItem[] = [];

  students.forEach((student) => {
    items.push({
      id: `student-${student.id}`,
      type: "student_added",
      at: student.createdAt,
      title: `${student.fullName} was added as a new student`,
      description: student.batchName,
    });
  });

  sessions.forEach((session) => {
    const markedAt = session.records[0]?.markedAt ?? `${session.date}T00:00:00.000Z`;
    items.push({
      id: `attendance-${session.batchId}-${session.date}`,
      type: "attendance_marked",
      at: markedAt,
      title: `Attendance marked for ${session.batchName}`,
      description: `${session.presentCount} present, ${session.absentCount} absent of ${session.totalStudents}`,
    });
  });

  payments.forEach((payment) => {
    items.push({
      id: `payment-${payment.id}`,
      type: "payment_recorded",
      at: payment.createdAt.toISOString(),
      title: `Payment of ₹${Number(payment.amount).toLocaleString("en-IN")} recorded`,
      description: studentNameById.get(payment.studentId),
    });
  });

  tests.forEach((test) => {
    items.push({
      id: `test-${test.id}`,
      type: "test_created",
      at: test.createdAt,
      title: `Test "${test.name}" created`,
      description: batchNameById.get(test.batchId),
    });
  });

  const markSessionCounts = new Map<string, number>();
  allMarks.forEach((mark) => {
    const key = `${mark.testId}__${mark.createdAt}`;
    markSessionCounts.set(key, (markSessionCounts.get(key) ?? 0) + 1);
  });
  markSessionCounts.forEach((count, key) => {
    const [testId, createdAt] = key.split("__");
    const test = testById.get(testId);
    items.push({
      id: `marks-${testId}-${createdAt}`,
      type: "marks_entered",
      at: createdAt,
      title: `Marks entered for ${test?.name ?? "a test"}`,
      description: `${count} student${count === 1 ? "" : "s"} scored`,
    });
  });

  return items.sort((a, b) => (a.at < b.at ? 1 : -1)).slice(0, limit);
}

export async function getDashboardTrends(
  teacherId: string,
  monthsBack = 6,
): Promise<DashboardTrends> {
  const [attendanceStats, collectionStats, testSummaries] = await Promise.all([
    getMonthlyAttendanceStats(teacherId, monthsBack),
    getMonthlyCollectionStats(teacherId, monthsBack),
    getMonthlyTestSummaries(teacherId, monthsBack),
  ]);

  return {
    attendance: attendanceStats.map((point) => ({
      label: monthLabel(point.month),
      percentage: point.averagePercentage,
    })),
    feeCollection: collectionStats.map((point) => ({
      label: monthLabel(point.month),
      percentage: point.collectionRate,
    })),
    marks: testSummaries.map((point) => ({
      label: monthLabel(point.month),
      percentage: point.averagePercentage,
    })),
  };
}
