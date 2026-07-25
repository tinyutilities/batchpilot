"use server";

import { prisma } from "@/server/db/prisma";
import { getCurrentTeacher } from "@/server/auth/get-current-teacher";
import {
  instituteProfileSchema,
  teacherPreferencesSchema,
  teacherProfileSchema,
} from "@/server/teacher/validators";
import type {
  InstituteProfile,
  TeacherPreferences,
  TeacherProfile,
} from "@/types/teacher";

export async function updateTeacherProfile(patch: Partial<TeacherProfile>) {
  const teacher = await getCurrentTeacher();
  if (!teacher) throw new Error("Not authenticated");

  const data = teacherProfileSchema.parse(patch);

  await prisma.teacher.update({
    where: { id: teacher.id },
    data: {
      ...(data.fullName !== undefined && { fullName: data.fullName }),
      ...(data.email !== undefined && { email: data.email }),
      ...(data.phone !== undefined && { phone: data.phone }),
      ...(data.designation !== undefined && { designation: data.designation }),
    },
  });
}

export async function updateInstituteProfile(
  patch: Partial<InstituteProfile>,
) {
  const teacher = await getCurrentTeacher();
  if (!teacher) throw new Error("Not authenticated");

  const data = instituteProfileSchema.parse(patch);

  await prisma.institute.upsert({
    where: { teacherId: teacher.id },
    create: { teacherId: teacher.id, ...data },
    update: data,
  });
}

export async function updateTeacherPreferences(
  patch: Partial<TeacherPreferences>,
) {
  const teacher = await getCurrentTeacher();
  if (!teacher) throw new Error("Not authenticated");

  const data = teacherPreferencesSchema.parse(patch);

  await prisma.teacher.update({
    where: { id: teacher.id },
    data,
  });
}
