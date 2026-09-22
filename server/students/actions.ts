"use server";

import { prisma } from "@/server/db/prisma";
import { getCurrentTeacher } from "@/server/auth/get-current-teacher";
import {
  getAllStudents,
  getAttendancePercentagesByStudentIds,
  getPendingFeesByStudentIds,
} from "@/server/students/queries";
import { studentFormSchema } from "@/server/students/validators";
import {
  genderToPrisma,
  mapStudent,
  studentStatusToPrisma,
} from "@/server/students/mappers";
import type { Student, StudentFormData } from "@/types/student";

// Client-callable wrapper around getAllStudents for the SWR cache layer —
// queries.ts stays teacherId-explicit for Server Component call sites.
export async function fetchStudents(): Promise<Student[]> {
  const teacher = await getCurrentTeacher();
  if (!teacher) throw new Error("Not authenticated");
  return getAllStudents(teacher.id);
}

export async function createStudent(data: StudentFormData): Promise<Student> {
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
      notes: parsed.notes || null,
      status: studentStatusToPrisma(parsed.status),
      batchId: parsed.batchId,
      teacherId: teacher.id,
    },
  });

  const [batch, attendanceByStudent, pendingFeesByStudent] = await Promise.all([
    student.batchId
      ? prisma.batch.findUnique({ where: { id: student.batchId }, select: { name: true } })
      : Promise.resolve(null),
    getAttendancePercentagesByStudentIds(teacher.id, [student.id]),
    getPendingFeesByStudentIds(teacher.id, [student.id]),
  ]);

  return mapStudent(student, {
    batchName: batch?.name ?? "",
    attendancePercentage: attendanceByStudent.get(student.id) ?? 0,
    pendingFees: pendingFeesByStudent.get(student.id) ?? 0,
  });
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
      notes: parsed.notes || null,
      status: studentStatusToPrisma(parsed.status),
      batchId: parsed.batchId,
    },
  });

  return id;
}

// Archiving hides a student from the active roster while keeping their
// attendance/fee/marks history intact — unlike delete, which removes the
// row (and, via cascade, that history) entirely.
export async function archiveStudent(id: string): Promise<boolean> {
  const teacher = await getCurrentTeacher();
  if (!teacher) throw new Error("Not authenticated");

  const existing = await prisma.student.findFirst({
    where: { id, teacherId: teacher.id },
  });
  if (!existing) return false;

  await prisma.student.update({
    where: { id },
    data: { status: "ARCHIVED" },
  });
  return true;
}

export async function unarchiveStudent(id: string): Promise<boolean> {
  const teacher = await getCurrentTeacher();
  if (!teacher) throw new Error("Not authenticated");

  const existing = await prisma.student.findFirst({
    where: { id, teacherId: teacher.id },
  });
  if (!existing) return false;

  await prisma.student.update({
    where: { id },
    data: { status: "ACTIVE" },
  });
  return true;
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
