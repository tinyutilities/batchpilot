import { redirect } from "next/navigation";
import { getCurrentTeacher } from "@/server/auth/get-current-teacher";
import { getTeacherInitials } from "@/lib/calculations/teacher";
import { DashboardShellClient } from "@/components/layout/DashboardShellClient";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const teacher = await getCurrentTeacher();
  if (!teacher) {
    redirect("/auth/login");
  }

  const teacherName = teacher.fullName || "Your Name";
  const teacherEmail = teacher.email || "Add your email in Settings";
  const avatarInitials = getTeacherInitials(teacher.fullName ?? "");

  return (
    <DashboardShellClient
      teacherName={teacherName}
      teacherEmail={teacherEmail}
      avatarInitials={avatarInitials}
    >
      {children}
    </DashboardShellClient>
  );
}
