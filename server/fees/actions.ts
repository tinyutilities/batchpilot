"use server";

import { prisma } from "@/server/db/prisma";
import { getCurrentTeacher } from "@/server/auth/get-current-teacher";
import { paymentInputSchema } from "@/server/fees/validators";
import { mapFee, mapPayment, paymentMethodToPrisma } from "@/server/fees/mappers";
import { parseDateKey, toDateKey, toMonthKey } from "@/lib/utils";
import type { FeeRecord, Payment, PaymentInput } from "@/types/fees";

const DEFAULT_MONTHLY_FEE = 3000;

export async function getOrCreateCurrentMonthFee(
  studentId: string,
): Promise<FeeRecord | null> {
  const teacher = await getCurrentTeacher();
  if (!teacher) throw new Error("Not authenticated");

  const student = await prisma.student.findFirst({
    where: { id: studentId, teacherId: teacher.id },
  });
  if (!student || !student.batchId) return null;

  const monthKey = toMonthKey(new Date());
  const existing = await prisma.fee.findFirst({
    where: { teacherId: teacher.id, studentId, month: monthKey },
  });
  if (existing) return mapFee(existing);

  const batch = await prisma.batch.findUnique({ where: { id: student.batchId } });
  const amount = batch?.monthlyFee ? Number(batch.monthlyFee) : DEFAULT_MONTHLY_FEE;
  const dueDate = parseDateKey(
    toDateKey(new Date(new Date().getFullYear(), new Date().getMonth(), 5)),
  );

  const created = await prisma.fee.create({
    data: {
      studentId,
      batchId: student.batchId,
      teacherId: teacher.id,
      month: monthKey,
      amount,
      amountPaid: 0,
      dueDate,
    },
  });

  return mapFee(created);
}

export async function recordPayment(
  feeId: string,
  input: PaymentInput,
): Promise<Payment | null> {
  const teacher = await getCurrentTeacher();
  if (!teacher) throw new Error("Not authenticated");

  const fee = await prisma.fee.findFirst({ where: { id: feeId, teacherId: teacher.id } });
  if (!fee) return null;

  const parsed = paymentInputSchema.parse(input);

  const [payment] = await prisma.$transaction([
    prisma.payment.create({
      data: {
        feeId,
        studentId: fee.studentId,
        teacherId: teacher.id,
        amount: parsed.amount,
        method: paymentMethodToPrisma(parsed.method),
        date: parseDateKey(parsed.date),
        referenceNumber: parsed.referenceNumber || null,
        notes: parsed.notes || null,
      },
    }),
    prisma.fee.update({
      where: { id: feeId },
      data: { amountPaid: { increment: parsed.amount } },
    }),
  ]);

  return mapPayment(payment);
}
