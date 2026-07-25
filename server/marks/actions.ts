"use server";

import { z } from "zod";
import { prisma } from "@/server/db/prisma";
import { getCurrentTeacher } from "@/server/auth/get-current-teacher";
import { markEntrySchema, testFormSchema } from "@/server/marks/validators";
import { mapMark, markStatusToPrisma } from "@/server/marks/mappers";
import { parseDateKey } from "@/lib/utils";
import type { MarkEntryInput, MarkRecord, TestFormData } from "@/types/marks";

export async function createTest(data: TestFormData): Promise<string> {
  const teacher = await getCurrentTeacher();
  if (!teacher) throw new Error("Not authenticated");

  const parsed = testFormSchema.parse(data);

  const batch = await prisma.batch.findFirst({
    where: { id: parsed.batchId, teacherId: teacher.id },
  });
  if (!batch) throw new Error("Batch not found");

  const test = await prisma.exam.create({
    data: {
      name: parsed.name,
      subject: parsed.subject,
      batchId: parsed.batchId,
      teacherId: teacher.id,
      maxMarks: parsed.maxMarks,
      testDate: parseDateKey(parsed.testDate),
      remarks: parsed.remarks || null,
    },
  });

  return test.id;
}

export async function updateTest(
  id: string,
  data: TestFormData,
): Promise<string | null> {
  const teacher = await getCurrentTeacher();
  if (!teacher) throw new Error("Not authenticated");

  const existing = await prisma.exam.findFirst({
    where: { id, teacherId: teacher.id },
  });
  if (!existing) return null;

  const parsed = testFormSchema.parse(data);

  await prisma.exam.update({
    where: { id },
    data: {
      name: parsed.name,
      subject: parsed.subject,
      batchId: parsed.batchId,
      maxMarks: parsed.maxMarks,
      testDate: parseDateKey(parsed.testDate),
      remarks: parsed.remarks || null,
    },
  });

  return id;
}

export async function deleteTest(id: string): Promise<boolean> {
  const teacher = await getCurrentTeacher();
  if (!teacher) throw new Error("Not authenticated");

  const existing = await prisma.exam.findFirst({
    where: { id, teacherId: teacher.id },
  });
  if (!existing) return false;

  await prisma.exam.delete({ where: { id } });
  return true;
}

export async function saveMarksForTest(
  testId: string,
  entries: MarkEntryInput[],
): Promise<MarkRecord[]> {
  const teacher = await getCurrentTeacher();
  if (!teacher) throw new Error("Not authenticated");

  const test = await prisma.exam.findFirst({
    where: { id: testId, teacherId: teacher.id },
  });
  if (!test) throw new Error("Test not found");

  const parsedEntries = z.array(markEntrySchema).parse(entries);

  await prisma.$transaction(
    parsedEntries.map((entry) =>
      prisma.mark.upsert({
        where: {
          studentId_examId: { studentId: entry.studentId, examId: testId },
        },
        create: {
          studentId: entry.studentId,
          examId: testId,
          teacherId: teacher.id,
          marksObtained: entry.status === "absent" ? 0 : entry.marksObtained,
          status: markStatusToPrisma(entry.status),
        },
        update: {
          marksObtained: entry.status === "absent" ? 0 : entry.marksObtained,
          status: markStatusToPrisma(entry.status),
        },
      }),
    ),
  );

  const rows = await prisma.mark.findMany({
    where: { teacherId: teacher.id, examId: testId },
  });
  return rows.map(mapMark);
}
