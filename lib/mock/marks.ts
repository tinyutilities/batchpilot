// lib/mock/marks.ts

import type {
  Grade,
  MarkEntryInput,
  MarkEntrySession,
  MarkRecord,
  MarksStatsData,
  MonthlyTestSummary,
  StudentMarkRecord,
  StudentMarkSummary,
  SubjectSummary,
  Test,
  TestFormData,
  TestResultRow,
  TestResultSummary,
  TopperEntry,
} from "@/types/marks";
import {
  getBatchById,
  getStudentsByBatch,
  mockBatches,
} from "@/lib/mock/batch";
import { mockStudents } from "@/lib/mock/student";
import { seededRandom, toDateKey, toMonthKey } from "@/lib/utils";
import { USE_DEMO_DATA } from "@/lib/config";

const PASS_THRESHOLD = 35;

export function calculatePercentage(
  marksObtained: number,
  maxMarks: number,
): number {
  if (maxMarks <= 0) return 0;
  return Math.round((marksObtained / maxMarks) * 1000) / 10;
}

export function calculateGrade(percentage: number): Grade {
  if (percentage >= 90) return "A+";
  if (percentage >= 80) return "A";
  if (percentage >= 70) return "B+";
  if (percentage >= 60) return "B";
  if (percentage >= 50) return "C";
  if (percentage >= PASS_THRESHOLD) return "D";
  return "F";
}

export function isPassing(percentage: number): boolean {
  return percentage >= PASS_THRESHOLD;
}

function makeTestId(batchId: string, index: number) {
  return `test-${batchId}-${index}`;
}

function makeMarkId(testId: string, studentId: string) {
  return `mark-${testId}-${studentId}`;
}

const TEST_TEMPLATES: { name: string; maxMarks: number; weeksAgo: number }[] = [
  { name: "Unit Test 1", maxMarks: 50, weeksAgo: 6 },
  { name: "Unit Test 2", maxMarks: 50, weeksAgo: 4 },
  { name: "Mid Term", maxMarks: 100, weeksAgo: 2 },
];

function generateSeedData(): { tests: Test[]; marks: MarkRecord[] } {
  const tests: Test[] = [];
  const marks: MarkRecord[] = [];
  const today = new Date();

  mockBatches.forEach((batch, batchIndex) => {
    const roster = getStudentsByBatch(batch.id);
    if (roster.length === 0) return;

    TEST_TEMPLATES.forEach((template, testIndex) => {
      const testDate = new Date(today);
      testDate.setDate(testDate.getDate() - template.weeksAgo * 7);

      const testId = makeTestId(batch.id, testIndex);
      tests.push({
        id: testId,
        name: template.name,
        subject: batch.subject,
        batchId: batch.id,
        maxMarks: template.maxMarks,
        testDate: toDateKey(testDate),
        createdAt: testDate.toISOString(),
      });

      roster.forEach((student, studentIndex) => {
        const seed = batchIndex * 10000 + testIndex * 100 + studentIndex;
        const isAbsent = seededRandom(seed) < 0.05;

        if (isAbsent) {
          marks.push({
            id: makeMarkId(testId, student.id),
            testId,
            studentId: student.id,
            marksObtained: 0,
            status: "absent",
            createdAt: testDate.toISOString(),
          });
          return;
        }

        const percentage = 35 + Math.round(seededRandom(seed + 1) * 60);
        const marksObtained = Math.round(
          (percentage / 100) * template.maxMarks,
        );

        marks.push({
          id: makeMarkId(testId, student.id),
          testId,
          studentId: student.id,
          marksObtained,
          status: "present",
          createdAt: testDate.toISOString(),
        });
      });
    });
  });

  return { tests, marks };
}

// A first-time user hasn't created any tests yet — only seed demo data when
// the feature flag is on (see lib/config.ts). This also cascades naturally:
// generateSeedData() derives everything from mockBatches, so it would
// already produce empty arrays once that repository is empty.
const seed = USE_DEMO_DATA ? generateSeedData() : { tests: [], marks: [] };
export const mockTests: Test[] = seed.tests;
export const mockMarks: MarkRecord[] = seed.marks;

export function getTestById(id: string): Test | undefined {
  return mockTests.find((test) => test.id === id);
}

export function getAllTests(): Test[] {
  return [...mockTests].sort((a, b) => (a.testDate < b.testDate ? 1 : -1));
}

export function getTestsByBatch(batchId: string): Test[] {
  return mockTests
    .filter((test) => test.batchId === batchId)
    .sort((a, b) => (a.testDate < b.testDate ? 1 : -1));
}

export function getMarksByTest(testId: string): MarkRecord[] {
  return mockMarks.filter((mark) => mark.testId === testId);
}

export function getMarksByStudent(studentId: string): MarkRecord[] {
  return mockMarks.filter((mark) => mark.studentId === studentId);
}

export function getMarkByTestAndStudent(
  testId: string,
  studentId: string,
): MarkRecord | undefined {
  return mockMarks.find(
    (mark) => mark.testId === testId && mark.studentId === studentId,
  );
}

export function createTest(data: TestFormData): Test {
  const test: Test = {
    id: `test-${data.batchId}-${crypto.randomUUID()}`,
    name: data.name,
    subject: data.subject,
    batchId: data.batchId,
    maxMarks: data.maxMarks,
    testDate: data.testDate,
    remarks: data.remarks || undefined,
    createdAt: new Date().toISOString(),
  };

  mockTests.push(test);
  return test;
}

export function updateTest(id: string, data: TestFormData): Test | null {
  const index = mockTests.findIndex((test) => test.id === id);
  if (index === -1) return null;

  const updated: Test = {
    ...mockTests[index],
    name: data.name,
    subject: data.subject,
    batchId: data.batchId,
    maxMarks: data.maxMarks,
    testDate: data.testDate,
    remarks: data.remarks || undefined,
  };
  mockTests[index] = updated;
  return updated;
}

export function deleteTest(id: string): boolean {
  const index = mockTests.findIndex((test) => test.id === id);
  if (index === -1) return false;

  mockTests.splice(index, 1);
  for (let i = mockMarks.length - 1; i >= 0; i--) {
    if (mockMarks[i].testId === id) mockMarks.splice(i, 1);
  }
  return true;
}

export function saveMarksForTest(
  testId: string,
  entries: MarkEntryInput[],
): MarkRecord[] {
  const markedAt = new Date().toISOString();
  const saved: MarkRecord[] = [];

  entries.forEach((entry) => {
    const id = makeMarkId(testId, entry.studentId);
    const index = mockMarks.findIndex((mark) => mark.id === id);
    const record: MarkRecord = {
      id,
      testId,
      studentId: entry.studentId,
      marksObtained: entry.status === "absent" ? 0 : entry.marksObtained,
      status: entry.status,
      createdAt: markedAt,
    };

    if (index === -1) {
      mockMarks.push(record);
    } else {
      mockMarks[index] = record;
    }
    saved.push(record);
  });

  return saved;
}

export function deleteMark(id: string): boolean {
  const index = mockMarks.findIndex((mark) => mark.id === id);
  if (index === -1) return false;

  mockMarks.splice(index, 1);
  return true;
}

export function getTestResultSummary(testId: string): TestResultSummary | null {
  const test = getTestById(testId);
  if (!test) return null;

  const batch = getBatchById(test.batchId);
  const percentages = getMarksByTest(testId)
    .filter((mark) => mark.status === "present")
    .map((mark) => calculatePercentage(mark.marksObtained, test.maxMarks));

  return {
    test,
    batchName: batch?.name ?? "Unknown Batch",
    studentsAppeared: percentages.length,
    averagePercentage:
      percentages.length > 0
        ? Math.round(
            percentages.reduce((sum, value) => sum + value, 0) /
              percentages.length,
          )
        : 0,
    highestPercentage:
      percentages.length > 0 ? Math.round(Math.max(...percentages)) : 0,
    lowestPercentage:
      percentages.length > 0 ? Math.round(Math.min(...percentages)) : 0,
    passCount: percentages.filter((p) => isPassing(p)).length,
    failCount: percentages.filter((p) => !isPassing(p)).length,
  };
}

export function getAllTestResultSummaries(): TestResultSummary[] {
  return getAllTests()
    .map((test) => getTestResultSummary(test.id))
    .filter((summary): summary is TestResultSummary => summary !== null);
}

export function getBatchMarkHistory(batchId: string): TestResultSummary[] {
  return getTestsByBatch(batchId)
    .map((test) => getTestResultSummary(test.id))
    .filter((summary): summary is TestResultSummary => summary !== null);
}

export function getTestResultRows(testId: string): TestResultRow[] {
  const test = getTestById(testId);
  if (!test) return [];

  return getStudentsByBatch(test.batchId).map((student) => {
    const mark = getMarkByTestAndStudent(testId, student.id) ?? null;
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

export function computeMarksStats(tests: Test[]): MarksStatsData {
  const testIds = new Set(tests.map((test) => test.id));
  const percentages = mockMarks
    .filter((mark) => testIds.has(mark.testId) && mark.status === "present")
    .map((mark) => {
      const test = getTestById(mark.testId);
      return test ? calculatePercentage(mark.marksObtained, test.maxMarks) : 0;
    });

  const passCount = percentages.filter((p) => isPassing(p)).length;

  return {
    totalTests: tests.length,
    averagePercentage:
      percentages.length > 0
        ? Math.round(
            percentages.reduce((sum, value) => sum + value, 0) /
              percentages.length,
          )
        : 0,
    highestPercentage:
      percentages.length > 0 ? Math.round(Math.max(...percentages)) : 0,
    lowestPercentage:
      percentages.length > 0 ? Math.round(Math.min(...percentages)) : 0,
    passRate:
      percentages.length > 0
        ? Math.round((passCount / percentages.length) * 100)
        : 0,
  };
}

export function getSubjectSummaries(
  tests: Test[] = getAllTests(),
): SubjectSummary[] {
  const subjectMap = new Map<
    string,
    { testsCount: number; percentages: number[] }
  >();

  tests.forEach((test) => {
    const percentages = getMarksByTest(test.id)
      .filter((mark) => mark.status === "present")
      .map((mark) => calculatePercentage(mark.marksObtained, test.maxMarks));

    const entry = subjectMap.get(test.subject) ?? {
      testsCount: 0,
      percentages: [],
    };
    entry.testsCount += 1;
    entry.percentages.push(...percentages);
    subjectMap.set(test.subject, entry);
  });

  return Array.from(subjectMap.entries()).map(([subject, data]) => ({
    subject,
    testsCount: data.testsCount,
    averagePercentage:
      data.percentages.length > 0
        ? Math.round(
            data.percentages.reduce((sum, value) => sum + value, 0) /
              data.percentages.length,
          )
        : 0,
  }));
}

function getExtremeScorer(
  tests: Test[],
  isBetter: (candidate: number, current: number) => boolean,
): TopperEntry | null {
  const testIds = new Set(tests.map((test) => test.id));
  const relevantMarks = mockMarks.filter(
    (mark) => testIds.has(mark.testId) && mark.status === "present",
  );

  let best: { studentId: string; percentage: number } | null = null;

  for (const mark of relevantMarks) {
    const test = getTestById(mark.testId);
    if (!test) continue;
    const percentage = calculatePercentage(mark.marksObtained, test.maxMarks);
    if (!best || isBetter(percentage, best.percentage)) {
      best = { studentId: mark.studentId, percentage };
    }
  }

  if (!best) return null;

  const student = mockStudents.find((s) => s.id === best.studentId);
  return {
    studentId: best.studentId,
    studentName: student?.fullName ?? "Unknown Student",
    percentage: Math.round(best.percentage),
  };
}

export function getTopScorer(tests: Test[]): TopperEntry | null {
  return getExtremeScorer(tests, (candidate, current) => candidate > current);
}

export function getLowestScorer(tests: Test[]): TopperEntry | null {
  return getExtremeScorer(tests, (candidate, current) => candidate < current);
}

export function getMonthlyTestSummaries(monthsBack = 6): MonthlyTestSummary[] {
  const today = new Date();
  const results: MonthlyTestSummary[] = [];

  for (let offset = monthsBack - 1; offset >= 0; offset--) {
    const monthDate = new Date(
      today.getFullYear(),
      today.getMonth() - offset,
      1,
    );
    const monthKey = toMonthKey(monthDate);
    const monthTests = mockTests.filter(
      (test) => toMonthKey(new Date(test.testDate)) === monthKey,
    );
    const stats = computeMarksStats(monthTests);

    results.push({
      month: monthKey,
      testsCount: monthTests.length,
      averagePercentage: stats.averagePercentage,
    });
  }

  return results;
}

export function getStudentMarkSummary(studentId: string): StudentMarkSummary {
  const records: StudentMarkRecord[] = getMarksByStudent(studentId)
    .filter((mark) => mark.status === "present")
    .map((mark) => {
      const test = getTestById(mark.testId);
      if (!test) return null;
      const percentage = calculatePercentage(mark.marksObtained, test.maxMarks);
      return { ...mark, test, percentage, grade: calculateGrade(percentage) };
    })
    .filter((record): record is StudentMarkRecord => record !== null)
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
  const subjectAverages: SubjectSummary[] = Array.from(
    subjectMap.entries(),
  ).map(([subject, percentages]) => ({
    subject,
    testsCount: percentages.length,
    averagePercentage: Math.round(
      percentages.reduce((sum, value) => sum + value, 0) / percentages.length,
    ),
  }));

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

export function getMarkEntrySessions(): MarkEntrySession[] {
  const sessionMap = new Map<string, MarkRecord[]>();

  mockMarks.forEach((mark) => {
    const key = `${mark.testId}__${mark.createdAt}`;
    const list = sessionMap.get(key) ?? [];
    list.push(mark);
    sessionMap.set(key, list);
  });

  return Array.from(sessionMap.entries()).map(([key, records]) => {
    const [testId, createdAt] = key.split("__");
    return { testId, createdAt, count: records.length };
  });
}
