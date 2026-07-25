import { prisma } from "@/server/db/prisma";
import { mapMark, mapTest } from "@/server/marks/mappers";
import { getStudentsByBatch } from "@/server/batches/queries";
import {
  calculateGrade,
  calculatePercentage,
  computeMarksStats,
  computeTestResultSummary,
} from "@/lib/calculations/marks";
import { toMonthKey } from "@/lib/utils";
import type {
  MarkRecord,
  MonthlyTestSummary,
  StudentMarkSummary,
  SubjectSummary,
  Test,
  TestResultRow,
  TestResultSummary,
} from "@/types/marks";

export async function getAllTests(teacherId: string): Promise<Test[]> {
  const rows = await prisma.exam.findMany({
    where: { teacherId },
    orderBy: { testDate: "desc" },
  });
  return rows.map(mapTest);
}

export async function getTestById(
  teacherId: string,
  id: string,
): Promise<Test | null> {
  const row = await prisma.exam.findFirst({ where: { id, teacherId } });
  return row ? mapTest(row) : null;
}

export async function getAllMarks(teacherId: string): Promise<MarkRecord[]> {
  const rows = await prisma.mark.findMany({ where: { teacherId } });
  return rows.map(mapMark);
}

export async function getMarksByTest(
  teacherId: string,
  testId: string,
): Promise<MarkRecord[]> {
  const rows = await prisma.mark.findMany({
    where: { teacherId, examId: testId },
  });
  return rows.map(mapMark);
}

export async function getAllTestResultSummaries(
  teacherId: string,
): Promise<TestResultSummary[]> {
  const [tests, marks, batches] = await Promise.all([
    getAllTests(teacherId),
    getAllMarks(teacherId),
    prisma.batch.findMany({ where: { teacherId }, select: { id: true, name: true } }),
  ]);

  const batchNameById = new Map(batches.map((b) => [b.id, b.name]));
  const marksByTestId = new Map<string, MarkRecord[]>();
  marks.forEach((mark) => {
    const list = marksByTestId.get(mark.testId) ?? [];
    list.push(mark);
    marksByTestId.set(mark.testId, list);
  });

  return tests.map((test) =>
    computeTestResultSummary(
      test,
      marksByTestId.get(test.id) ?? [],
      batchNameById.get(test.batchId) ?? "Unknown Batch",
    ),
  );
}

export async function getTestResultSummary(
  teacherId: string,
  testId: string,
): Promise<TestResultSummary | null> {
  const test = await getTestById(teacherId, testId);
  if (!test) return null;

  const [marks, batch] = await Promise.all([
    getMarksByTest(teacherId, testId),
    prisma.batch.findUnique({ where: { id: test.batchId }, select: { name: true } }),
  ]);

  return computeTestResultSummary(test, marks, batch?.name ?? "Unknown Batch");
}

export async function getTestResultRows(
  teacherId: string,
  testId: string,
): Promise<TestResultRow[]> {
  const test = await getTestById(teacherId, testId);
  if (!test) return [];

  const [students, marks] = await Promise.all([
    getStudentsByBatch(teacherId, test.batchId),
    getMarksByTest(teacherId, testId),
  ]);
  const markByStudentId = new Map(marks.map((mark) => [mark.studentId, mark]));

  return students.map((student) => {
    const mark = markByStudentId.get(student.id) ?? null;
    const isScored = mark !== null && mark.status === "present";
    const percentage = isScored
      ? calculatePercentage(mark.marksObtained, test.maxMarks)
      : 0;

    return {
      studentId: student.id,
      studentName: student.fullName,
      mark,
      percentage,
      grade: isScored ? calculateGrade(percentage) : null,
    };
  });
}

export async function getMonthlyTestSummaries(
  teacherId: string,
  monthsBack = 6,
): Promise<MonthlyTestSummary[]> {
  const [tests, allMarks] = await Promise.all([
    getAllTests(teacherId),
    getAllMarks(teacherId),
  ]);
  const today = new Date();
  const results: MonthlyTestSummary[] = [];

  for (let offset = monthsBack - 1; offset >= 0; offset--) {
    const monthDate = new Date(today.getFullYear(), today.getMonth() - offset, 1);
    const monthKey = toMonthKey(monthDate);
    const monthTests = tests.filter(
      (test) => toMonthKey(new Date(test.testDate)) === monthKey,
    );
    const stats = computeMarksStats(monthTests, allMarks);

    results.push({
      month: monthKey,
      testsCount: monthTests.length,
      averagePercentage: stats.averagePercentage,
    });
  }

  return results;
}

export async function getStudentMarkSummary(
  teacherId: string,
  studentId: string,
): Promise<StudentMarkSummary> {
  const [markRows, tests] = await Promise.all([
    prisma.mark.findMany({ where: { teacherId, studentId } }),
    getAllTests(teacherId),
  ]);
  const marks = markRows.map(mapMark);
  const testById = new Map(tests.map((test) => [test.id, test]));

  const records = marks
    .filter((mark) => mark.status === "present")
    .map((mark) => {
      const test = testById.get(mark.testId);
      if (!test) return null;
      const percentage = calculatePercentage(mark.marksObtained, test.maxMarks);
      return { ...mark, test, percentage, grade: calculateGrade(percentage) };
    })
    .filter((record): record is NonNullable<typeof record> => record !== null)
    .sort((a, b) => (a.test.testDate < b.test.testDate ? 1 : -1));

  const overallPercentage =
    records.length > 0
      ? Math.round(
          records.reduce((sum, record) => sum + record.percentage, 0) /
            records.length,
        )
      : 0;

  const subjectMap = new Map<string, number[]>();
  records.forEach((record) => {
    const list = subjectMap.get(record.test.subject) ?? [];
    list.push(record.percentage);
    subjectMap.set(record.test.subject, list);
  });
  const subjectAverages: SubjectSummary[] = Array.from(subjectMap.entries()).map(
    ([subject, percentages]) => ({
      subject,
      testsCount: percentages.length,
      averagePercentage: Math.round(
        percentages.reduce((sum, value) => sum + value, 0) / percentages.length,
      ),
    }),
  );

  let trend: "up" | "down" | "flat" = "flat";
  if (records.length >= 2) {
    if (records[0].percentage > records[1].percentage) trend = "up";
    else if (records[0].percentage < records[1].percentage) trend = "down";
  }

  return {
    studentId,
    testsCount: records.length,
    overallPercentage,
    subjectAverages,
    trend,
    records,
  };
}
