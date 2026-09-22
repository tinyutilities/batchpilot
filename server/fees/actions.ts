"use server";

import { prisma } from "@/server/db/prisma";
import { getCurrentTeacher } from "@/server/auth/get-current-teacher";
import {
  getAllFees,
  getBatchFeeGrid,
  getFeeById,
  getPaymentsByStudent,
} from "@/server/fees/queries";
import { getAllBatches } from "@/server/batches/queries";
import { paymentInputSchema } from "@/server/fees/validators";
import { mapFee, mapPayment, paymentMethodToPrisma } from "@/server/fees/mappers";
import { parseDateKey, toDateKey, toMonthKey } from "@/lib/utils";
import type {
  BatchFeeGridRow,
  FeeRecord,
  FeeTableRow,
  Payment,
  PaymentInput,
} from "@/types/fees";

// Client-callable wrapper for the SWR cache layer.
export async function fetchPaymentsForStudent(studentId: string): Promise<Payment[]> {
  const teacher = await getCurrentTeacher();
  if (!teacher) throw new Error("Not authenticated");
  return getPaymentsByStudent(teacher.id, studentId);
}

const DEFAULT_MONTHLY_FEE = 3000;

// Client-callable wrapper for the SWR cache layer — replicates the join
// app/dashboard/fees/page.tsx already does server-side for the initial fetch.
export async function fetchFeeTableRows(): Promise<FeeTableRow[]> {
  const teacher = await getCurrentTeacher();
  if (!teacher) throw new Error("Not authenticated");

  const [fees, batches, students] = await Promise.all([
    getAllFees(teacher.id),
    getAllBatches(teacher.id),
    prisma.student.findMany({
      where: { teacherId: teacher.id },
      select: { id: true, firstName: true, lastName: true },
    }),
  ]);

  const studentNameById = new Map(
    students.map((s) => [s.id, `${s.firstName} ${s.lastName}`.trim()]),
  );
  const batchNameById = new Map(batches.map((b) => [b.id, b.name]));

  return fees.map((fee) => ({
    fee,
    studentId: fee.studentId,
    studentName: studentNameById.get(fee.studentId) ?? "Unknown Student",
    batchName: batchNameById.get(fee.batchId) ?? "Unknown Batch",
  }));
}

export async function getOrCreateFeeForMonth(
  studentId: string,
  monthKey: string = toMonthKey(new Date()),
): Promise<FeeRecord | null> {
  const teacher = await getCurrentTeacher();
  if (!teacher) throw new Error("Not authenticated");

  const student = await prisma.student.findFirst({
    where: { id: studentId, teacherId: teacher.id },
  });
  if (!student || !student.batchId) return null;

  const existing = await prisma.fee.findFirst({
    where: { teacherId: teacher.id, studentId, month: monthKey },
  });
  if (existing) return mapFee(existing);

  const batch = await prisma.batch.findUnique({ where: { id: student.batchId } });
  const amount = batch?.monthlyFee ? Number(batch.monthlyFee) : DEFAULT_MONTHLY_FEE;
  const [year, month] = monthKey.split("-").map(Number);
  const dueDate = parseDateKey(toDateKey(new Date(year, month - 1, 5)));

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

// "Mark Pending" for a paid/partial grid cell — deletes payment history and
// zeroes amountPaid rather than adding a manual status-override field, so
// status stays fully derived (see computeFeeStatus).
export async function resetFeePayments(feeId: string): Promise<FeeRecord | null> {
  const teacher = await getCurrentTeacher();
  if (!teacher) throw new Error("Not authenticated");

  const fee = await prisma.fee.findFirst({ where: { id: feeId, teacherId: teacher.id } });
  if (!fee) return null;

  const [, updated] = await prisma.$transaction([
    prisma.payment.deleteMany({ where: { feeId } }),
    prisma.fee.update({ where: { id: feeId }, data: { amountPaid: 0 } }),
  ]);

  return mapFee(updated);
}

// "Mark Paid" quick action for a grid cell — materializes the fee for that
// month if needed, then pays off the remaining balance in one step.
export async function markFeePaidInFull(
  studentId: string,
  monthKey: string,
): Promise<FeeRecord | null> {
  const fee = await getOrCreateFeeForMonth(studentId, monthKey);
  if (!fee) return null;

  const balance = fee.amount - fee.amountPaid;
  if (balance <= 0) return fee;

  await recordPayment(fee.id, {
    amount: balance,
    method: "cash",
    date: toDateKey(new Date()),
  });

  const teacher = await getCurrentTeacher();
  if (!teacher) throw new Error("Not authenticated");
  return getFeeById(teacher.id, fee.id);
}

// Bulk version of markFeePaidInFull for an entire batch/month at once (the
// Fees page's "Mark All Paid" action). Reuses the same
// getOrCreateFeeForMonth/recordPayment primitives per student rather than
// duplicating the payment logic — the one thing it adds is skipping
// "not_due" months, which the single-student flow never needs to check
// because that button is already hidden for not-due cells in the UI; a
// bulk action has no such per-row gate, so it must check explicitly.
export async function markAllPaidForBatchMonth(
  batchId: string,
  monthKey: string,
): Promise<{ markedCount: number; totalCount: number }> {
  const teacher = await getCurrentTeacher();
  if (!teacher) throw new Error("Not authenticated");

  const batch = await prisma.batch.findFirst({
    where: { id: batchId, teacherId: teacher.id },
  });
  if (!batch) throw new Error("Batch not found");

  const students = await prisma.student.findMany({
    where: { teacherId: teacher.id, batchId },
    select: { id: true },
  });

  let markedCount = 0;
  const results = await Promise.allSettled(
    students.map(async (student) => {
      const fee = await getOrCreateFeeForMonth(student.id, monthKey);
      if (!fee || fee.status === "not_due" || fee.status === "paid") return;

      const balance = fee.amount - fee.amountPaid;
      if (balance <= 0) return;

      await recordPayment(fee.id, {
        amount: balance,
        method: "cash",
        date: toDateKey(new Date()),
      });
      markedCount += 1;
    }),
  );
  const failed = results.filter((r) => r.status === "rejected");
  if (failed.length > 0) {
    console.error(
      `[markAllPaidForBatchMonth] ${failed.length}/${students.length} payments failed`,
      failed.map((r) => (r as PromiseRejectedResult).reason),
    );
  }

  return { markedCount, totalCount: students.length };
}

// The first time a teacher opens a batch for a given month, materialize a
// real Fee row (Pending, amount = batch.monthlyFee) for every enrolled
// student instead of leaving it purely virtual — other parts of the app
// (dashboard stats, student pending-fees totals) sum real Fee rows only, so
// without this a freshly-opened month would look fully paid everywhere
// except the Fees page itself. Composed entirely from the existing
// getOrCreateFeeForMonth (per-student, idempotent) — no new Prisma logic.
export async function initializeFeesForBatchMonth(
  batchId: string,
  monthKey: string,
): Promise<void> {
  console.log("[initializeFeesForBatchMonth] called", { batchId, monthKey });

  const teacher = await getCurrentTeacher();
  if (!teacher) {
    console.error("[initializeFeesForBatchMonth] no authenticated teacher");
    throw new Error("Not authenticated");
  }

  const batch = await prisma.batch.findFirst({
    where: { id: batchId, teacherId: teacher.id },
  });
  if (!batch) {
    console.warn("[initializeFeesForBatchMonth] batch not found for this teacher", {
      batchId,
      teacherId: teacher.id,
    });
    return;
  }

  const students = await prisma.student.findMany({
    where: { teacherId: teacher.id, batchId },
    select: { id: true },
  });
  console.log(
    `[initializeFeesForBatchMonth] batch "${batch.name}" has ${students.length} student(s) to initialize for ${monthKey}`,
  );

  // allSettled, not all: one student's creation failing (e.g. a transient
  // race) must not prevent the others from being created, and must not
  // throw away the whole call so the caller's .then() never fires.
  const results = await Promise.allSettled(
    students.map((student) => getOrCreateFeeForMonth(student.id, monthKey)),
  );
  const failed = results.filter((r) => r.status === "rejected") as PromiseRejectedResult[];
  if (failed.length > 0) {
    console.error(
      `[initializeFeesForBatchMonth] ${failed.length}/${students.length} fee initializations failed`,
      failed.map((f) => f.reason),
    );
  }
  console.log(
    `[initializeFeesForBatchMonth] done — ${results.length - failed.length}/${students.length} succeeded`,
  );
}

// Client-callable wrapper for the SWR cache layer.
export async function fetchBatchFeeGrid(
  batchId: string,
  monthsBack?: number,
): Promise<BatchFeeGridRow[]> {
  const teacher = await getCurrentTeacher();
  if (!teacher) throw new Error("Not authenticated");
  return getBatchFeeGrid(teacher.id, batchId, monthsBack);
}
