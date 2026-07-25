import type {
  Grade,
  MarkRecord,
  MarksStatsData,
  SubjectSummary,
  Test,
  TestResultSummary,
  TopperEntry,
} from "@/types/marks";

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

export function computeTestResultSummary(
  test: Test,
  marks: MarkRecord[],
  batchName: string,
): TestResultSummary {
  const percentages = marks
    .filter((mark) => mark.status === "present")
    .map((mark) => calculatePercentage(mark.marksObtained, test.maxMarks));

  return {
    test,
    batchName,
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

export function computeMarksStats(
  tests: Test[],
  allMarks: MarkRecord[],
): MarksStatsData {
  const maxMarksByTestId = new Map(tests.map((test) => [test.id, test.maxMarks]));
  const percentages = allMarks
    .filter((mark) => maxMarksByTestId.has(mark.testId) && mark.status === "present")
    .map((mark) => calculatePercentage(mark.marksObtained, maxMarksByTestId.get(mark.testId)!));

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

export function computeSubjectSummaries(
  tests: Test[],
  allMarks: MarkRecord[],
): SubjectSummary[] {
  const marksByTestId = new Map<string, MarkRecord[]>();
  allMarks.forEach((mark) => {
    const list = marksByTestId.get(mark.testId) ?? [];
    list.push(mark);
    marksByTestId.set(mark.testId, list);
  });

  const subjectMap = new Map<string, { testsCount: number; percentages: number[] }>();

  tests.forEach((test) => {
    const marks = marksByTestId.get(test.id) ?? [];
    const percentages = marks
      .filter((mark) => mark.status === "present")
      .map((mark) => calculatePercentage(mark.marksObtained, test.maxMarks));

    const entry = subjectMap.get(test.subject) ?? { testsCount: 0, percentages: [] };
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

function computeExtremeScorer(
  tests: Test[],
  allMarks: MarkRecord[],
  studentNameById: Map<string, string>,
  isBetter: (candidate: number, current: number) => boolean,
): TopperEntry | null {
  const maxMarksByTestId = new Map(tests.map((test) => [test.id, test.maxMarks]));
  const relevantMarks = allMarks.filter(
    (mark) => maxMarksByTestId.has(mark.testId) && mark.status === "present",
  );

  let best: { studentId: string; percentage: number } | null = null;

  for (const mark of relevantMarks) {
    const maxMarks = maxMarksByTestId.get(mark.testId)!;
    const percentage = calculatePercentage(mark.marksObtained, maxMarks);
    if (!best || isBetter(percentage, best.percentage)) {
      best = { studentId: mark.studentId, percentage };
    }
  }

  if (!best) return null;

  return {
    studentId: best.studentId,
    studentName: studentNameById.get(best.studentId) ?? "Unknown Student",
    percentage: Math.round(best.percentage),
  };
}

export function computeTopScorer(
  tests: Test[],
  allMarks: MarkRecord[],
  studentNameById: Map<string, string>,
): TopperEntry | null {
  return computeExtremeScorer(tests, allMarks, studentNameById, (c, cur) => c > cur);
}

export function computeLowestScorer(
  tests: Test[],
  allMarks: MarkRecord[],
  studentNameById: Map<string, string>,
): TopperEntry | null {
  return computeExtremeScorer(tests, allMarks, studentNameById, (c, cur) => c < cur);
}
