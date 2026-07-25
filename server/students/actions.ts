"use server";

import { prisma } from "@/server/db/prisma";
import { getCurrentTeacher } from "@/server/auth/get-current-teacher";
import { studentFormSchema } from "@/server/students/validators";
import { genderToPrisma, studentStatusToPrisma } from "@/server/students/mappers";
import type { StudentFormData } from "@/types/student";

export async function createStudent(data: StudentFormData): Promise<string> {
  const teacher = await getCurrentTeacher();
  if (!teacher) throw new Error("Not authenticated");

  const parsed = studentFormSchema.parse(data);

  const student = await prisma.student.create({
    data: {
      firstName: parsed.firstName,
      lastName: parsed.lastName,
      email: parsed.email ?? "",
      phone: parsed.phone || null,
      gender: genderToPrisma(parsed.gender),
      dateOfBirth: parsed.dateOfBirth ? new Date(parsed.dateOfBirth) : null,
      guardianName: parsed.guardianName ?? "",
      guardianPhone: parsed.guardianPhone ?? "",
      address: parsed.address ?? "",
      school: parsed.school || null,
      status: studentStatusToPrisma(parsed.status),
      batchId: parsed.batchId,
      teacherId: teacher.id,
    },
  });

  return student.id;
}

export async function updateStudent(
  id: string,
  data: StudentFormData,
): Promise<string | null> {
  const teacher = await getCurrentTeacher();
  if (!teacher) throw new Error("Not authenticated");

  const existing = await prisma.student.findFirst({
    where: { id, teacherId: teacher.id },
  });
  if (!existing) return null;

  const parsed = studentFormSchema.parse(data);

  await prisma.student.update({
    where: { id },
    data: {
      firstName: parsed.firstName,
      lastName: parsed.lastName,
      email: parsed.email ?? "",
      phone: parsed.phone || null,
      gender: genderToPrisma(parsed.gender),
      dateOfBirth: parsed.dateOfBirth ? new Date(parsed.dateOfBirth) : null,
      guardianName: parsed.guardianName ?? "",
      guardianPhone: parsed.guardianPhone ?? "",
      address: parsed.address ?? "",
      school: parsed.school || null,
      status: studentStatusToPrisma(parsed.status),
      batchId: parsed.batchId,
    },
  });

  return id;
}

export async function deleteStudent(id: string): Promise<boolean> {
  const teacher = await getCurrentTeacher();
  if (!teacher) throw new Error("Not authenticated");

  const existing = await prisma.student.findFirst({
    where: { id, teacherId: teacher.id },
  });
  if (!existing) return false;

  await prisma.student.delete({ where: { id } });
  return true;
}
