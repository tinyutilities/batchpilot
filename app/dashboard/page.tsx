import { redirect } from "next/navigation";
import { getCurrentTeacher } from "@/server/auth/get-current-teacher";
import {
  getDashboardStats,
  getDashboardTrends,
  getRecentActivity,
  getTodaySchedule,
} from "@/server/dashboard/queries";
import { prisma } from "@/server/db/prisma";
import { getTimeOfDayGreeting } from "@/lib/calculations/dashboard";
import { getTeacherFirstName } from "@/lib/calculations/teacher";
import { toDateKey } from "@/lib/utils";
import WelcomeOnboarding from "@/components/dashboard/WelcomeOnboarding";
import DashboardPageClient from "@/components/dashboard/DashboardPageClient";

export default async function DashboardPage() {
  const teacher = await getCurrentTeacher();
  if (!teacher) {
    redirect("/auth/login");
  }

  const [batchCount, studentCount] = await Promise.all([
    prisma.batch.count({ where: { teacherId: teacher.id } }),
    prisma.student.count({ where: { teacherId: teacher.id } }),
  ]);

  // A brand-new teacher has created nothing at all yet — show onboarding
  // instead of an analytics dashboard full of meaningless zeros.
  const isNewUser = batchCount === 0 && studentCount === 0;
  if (isNewUser) {
    return <WelcomeOnboarding />;
  }

  const today = toDateKey(new Date());
  const greeting = getTimeOfDayGreeting();
  const firstName = getTeacherFirstName(teacher.fullName ?? "") || "Teacher";

  const [stats, schedule, activity, trends] = await Promise.all([
    getDashboardStats(teacher.id),
    getTodaySchedule(teacher.id),
    getRecentActivity(teacher.id, 8),
    getDashboardTrends(teacher.id, 6),
  ]);

  return (
    <DashboardPageClient
      greeting={greeting}
      firstName={firstName}
      today={today}
      stats={stats}
      schedule={schedule}
      activity={activity}
      trends={trends}
    />
  );
}
