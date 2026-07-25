// Mirrors the shape of the `Teacher`/`Role` model already defined in
// prisma/schema.prisma (id, name, username, email, phone, imageUrl,
// isActive, role, createdAt) so wiring this admin section to real data
// later is a data-source swap, not a type redesign.

export type TeacherStatus = "active" | "suspended";

export interface AdminTeacher {
  id: string;
  name: string;
  username: string;
  email: string;
  phone?: string;
  status: TeacherStatus;
  createdAt: string;
  batchCount: number;
  studentCount: number;
}

export type BugReportStatus = "open" | "in_progress" | "resolved" | "closed";

export interface BugReport {
  id: string;
  title: string;
  description: string;
  submittedBy: string;
  createdAt: string;
  status: BugReportStatus;
}

export interface AdminOverviewStats {
  totalTeachers: number;
  activeTeachers: number;
  totalStudents: number;
  totalBatches: number;
  totalAttendanceRecords: number;
  totalTests: number;
  totalFeeRecords: number;
  openBugReports: number;
}
