// lib/mock/admin.ts

import { USE_DEMO_DATA } from "@/lib/config";
import { mockBatches, getStudentsByBatch } from "@/lib/mock/batch";
import { mockStudents } from "@/lib/mock/student";
import { mockAttendanceRecords } from "@/lib/mock/attendance";
import { getAllFees } from "@/lib/mock/fees";
import { getAllTests } from "@/lib/mock/marks";
import type {
  AdminOverviewStats,
  AdminTeacher,
  BugReport,
  BugReportStatus,
} from "@/types/admin";

// Reuses the same teacher names already referenced by DEMO_BATCHES in
// lib/mock/batch.ts, so the demo dataset reads as one consistent
// installation rather than unrelated placeholder rows.
const DEMO_TEACHERS: AdminTeacher[] = [
  {
    id: "teacher-001",
    name: "Kavita Sharma",
    username: "kavita.sharma",
    email: "kavita.sharma@example.com",
    phone: "9876543200",
    status: "active",
    createdAt: "2025-05-01T09:00:00.000Z",
    batchCount: 1,
    studentCount: 0,
  },
  {
    id: "teacher-002",
    name: "Anil Verma",
    username: "anil.verma",
    email: "anil.verma@example.com",
    phone: "9876543201",
    status: "active",
    createdAt: "2025-05-02T09:00:00.000Z",
    batchCount: 1,
    studentCount: 0,
  },
  {
    id: "teacher-003",
    name: "Lakshmi Iyer",
    username: "lakshmi.iyer",
    email: "lakshmi.iyer@example.com",
    phone: "9876543202",
    status: "active",
    createdAt: "2025-05-03T09:00:00.000Z",
    batchCount: 1,
    studentCount: 0,
  },
  {
    id: "teacher-004",
    name: "Suresh Nair",
    username: "suresh.nair",
    email: "suresh.nair@example.com",
    phone: "9876543203",
    status: "suspended",
    createdAt: "2025-05-04T09:00:00.000Z",
    batchCount: 1,
    studentCount: 0,
  },
];

const DEMO_BUG_REPORTS: BugReport[] = [
  {
    id: "bug-001",
    title: "Attendance page slow to load on mobile",
    description:
      "Marking attendance for a large batch takes several seconds to become responsive on an Android tablet.",
    submittedBy: "Kavita Sharma",
    createdAt: "2026-07-10T10:15:00.000Z",
    status: "open",
  },
  {
    id: "bug-002",
    title: "Fee receipt shows wrong due date after edit",
    description:
      "Editing a batch's fee amount doesn't recalculate the due date shown on already-generated fee records.",
    submittedBy: "Anil Verma",
    createdAt: "2026-07-14T14:30:00.000Z",
    status: "in_progress",
  },
  {
    id: "bug-003",
    title: "Dark mode toggle doesn't persist after refresh",
    description:
      "Switching to dark mode in Settings works, but reloading the page sometimes shows light mode briefly.",
    submittedBy: "Lakshmi Iyer",
    createdAt: "2026-07-18T09:00:00.000Z",
    status: "resolved",
  },
];

// Every batch's enrolled-student count rolls up to its teacher — matches
// the mock architecture's pattern of deriving counts from existing
// repositories rather than storing them redundantly.
function withComputedCounts(teachers: AdminTeacher[]): AdminTeacher[] {
  return teachers.map((teacher) => {
    const teacherBatches = mockBatches.filter(
      (batch) => batch.teacherName === teacher.name,
    );
    const studentCount = teacherBatches.reduce(
      (sum, batch) => sum + getStudentsByBatch(batch.id).length,
      0,
    );
    return {
      ...teacher,
      batchCount: teacherBatches.length,
      studentCount,
    };
  });
}

export const mockTeachers: AdminTeacher[] = USE_DEMO_DATA
  ? withComputedCounts(DEMO_TEACHERS)
  : [];

export const mockBugReports: BugReport[] = USE_DEMO_DATA
  ? DEMO_BUG_REPORTS
  : [];

export function getTeacherById(id: string): AdminTeacher | undefined {
  return mockTeachers.find((teacher) => teacher.id === id);
}

export function getBatchesForTeacher(teacherName: string) {
  return mockBatches.filter((batch) => batch.teacherName === teacherName);
}

export function updateBugReportStatus(
  id: string,
  status: BugReportStatus,
): BugReport | null {
  const index = mockBugReports.findIndex((report) => report.id === id);
  if (index === -1) return null;

  const updated: BugReport = { ...mockBugReports[index], status };
  mockBugReports[index] = updated;
  return updated;
}

export function getAdminOverviewStats(): AdminOverviewStats {
  return {
    totalTeachers: mockTeachers.length,
    activeTeachers: mockTeachers.filter((t) => t.status === "active").length,
    totalStudents: mockStudents.length,
    totalBatches: mockBatches.length,
    totalAttendanceRecords: mockAttendanceRecords.length,
    totalTests: getAllTests().length,
    totalFeeRecords: getAllFees().length,
    openBugReports: mockBugReports.filter(
      (report) => report.status === "open" || report.status === "in_progress",
    ).length,
  };
}
