import { prisma } from "@/server/db/prisma";
import type { TeacherSettings } from "@/types/teacher";

export async function getTeacherSettings(
  teacherId: string,
): Promise<TeacherSettings> {
  const teacher = await prisma.teacher.findUniqueOrThrow({
    where: { id: teacherId },
    include: { institute: true },
  });

  return {
    profile: {
      fullName: teacher.fullName ?? "",
      email: teacher.email,
      phone: teacher.phone ?? "",
      designation: teacher.designation,
    },
    institute: {
      name: teacher.institute?.name ?? "",
      address: teacher.institute?.address ?? "",
      city: teacher.institute?.city ?? "",
      state: teacher.institute?.state ?? "",
      pincode: teacher.institute?.pincode ?? "",
      contactNumber: teacher.institute?.contactNumber ?? "",
      website: teacher.institute?.website ?? "",
    },
    preferences: {
      emailNotifications: teacher.emailNotifications,
      autoReports: teacher.autoReports,
      teachesUnderInstitute: teacher.teachesUnderInstitute,
    },
  };
}
