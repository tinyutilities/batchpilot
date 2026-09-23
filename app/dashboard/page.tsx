import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getCurrentTeacher } from "@/server/auth/get-current-teacher";
import { prisma } from "@/server/db/prisma";
import { getTimeOfDayGreeting } from "@/lib/calculations/dashboard";
import { getTeacherFirstName } from "@/lib/calculations/teacher";
import { toDateKey } from "@/lib/utils";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import WelcomeOnboarding from "@/components/dashboard/WelcomeOnboarding";
import DashboardMainSection from "@/components/dashboard/DashboardMainSection";
import DashboardTrendsSection from "@/components/dashboard/DashboardTrendsSection";
import {
  DashboardMainSkeleton,
  DashboardTrendsSkeleton,
} from "@/components/dashboard/DashboardSectionSkeletons";

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

  // The header needs only `teacher`, already resolved above — it renders
  // immediately instead of waiting on stats/schedule/activity/trends the
  // way the old single-client-component page did. The two sections below
  // stream in independently of each other (see each component's comment for
  // why they're split where they are).
  return (
    <PageContainer>
      <PageHeader
        title={`${greeting}, ${firstName} 👋`}
        description="Here's an overview of your tuition classes."
      />

      <Suspense fallback={<DashboardMainSkeleton />}>
        <DashboardMainSection teacherId={teacher.id} today={today} />
      </Suspense>

      <Suspense fallback={<DashboardTrendsSkeleton />}>
        <DashboardTrendsSection teacherId={teacher.id} />
      </Suspense>
    </PageContainer>
  );
}
