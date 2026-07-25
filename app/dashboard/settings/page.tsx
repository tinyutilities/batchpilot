import { redirect } from "next/navigation";
import { getCurrentTeacher } from "@/server/auth/get-current-teacher";
import { getTeacherSettings } from "@/server/teacher/queries";
import SettingsPageClient from "@/components/settings/SettingsPageClient";

export default async function SettingsPage() {
  const teacher = await getCurrentTeacher();
  if (!teacher) {
    redirect("/auth/login");
  }

  const settings = await getTeacherSettings(teacher.id);

  return <SettingsPageClient initialSettings={settings} />;
}
