import { prisma } from "@/server/db/prisma";
import { mapFee, mapPayment } from "@/server/fees/mappers";
import { toMonthKey } from "@/lib/utils";
import type {
  BatchFeeGridCell,
  BatchFeeGridRow,
  FeeRecord,
  MonthlyCollectionStats,
  Payment,
  StudentFeeSummary,
} from "@/types/fees";

export async function getAllFees(teacherId: string): Promise<FeeRecord[]> {
  const rows = await prisma.fee.findMany({
    where: { teacherId },
    orderBy: { dueDate: "desc" },
  });
  return rows.map(mapFee);
}

export async function getOverdueFees(teacherId: string): Promise<FeeRecord[]> {
  const all = await getAllFees(teacherId);
  return all.filter((fee) => fee.status === "overdue");
}

export async function getFeeById(
  teacherId: string,
  feeId: string,
): Promise<FeeRecord | null> {
  const row = await prisma.fee.findFirst({ where: { id: feeId, teacherId } });
  return row ? mapFee(row) : null;
}

export async function getFeesByStudent(
  teacherId: string,
  studentId: string,
): Promise<FeeRecord[]> {
  const rows = await prisma.fee.findMany({
    where: { teacherId, studentId },
    orderBy: { month: "desc" },
  });
  return rows.map(mapFee);
}

export async function getPaymentsByStudent(
  teacherId: string,
  studentId: string,
): Promise<Payment[]> {
  const rows = await prisma.payment.findMany({
    where: { teacherId, studentId },
    orderBy: { date: "desc" },
  });
  return rows.map(mapPayment);
}

export async function getMonthlyCollectionStats(
  teacherId: string,
  monthsBack = 6,
): Promise<MonthlyCollectionStats[]> {
  const today = new Date();
  const offsets = Array.from({ length: monthsBack }, (_, i) => monthsBack - 1 - i);
  // Same monthKey derivation as before, oldest to newest — computed once
  // up front instead of per-query.
  const monthKeys = offsets.map((offset) =>
    toMonthKey(new Date(today.getFullYear(), today.getMonth() - offset, 1)),
  );

  // Fee.month is a plain string column, so no date-range/timezone concerns
  // here — a single `in` query covers every month in the window.
  const rows = await prisma.fee.findMany({
    where: { teacherId, month: { in: monthKeys } },
  });

  const rowsByMonth = new Map<string, typeof rows>();
  rows.forEach((row) => {
    const list = rowsByMonth.get(row.month) ?? [];
    list.push(row);
    rowsByMonth.set(row.month, list);
  });

  return monthKeys.map((monthKey) => {
    const monthRows = rowsByMonth.get(monthKey) ?? [];
    const billed = monthRows.reduce((sum, row) => sum + Number(row.amount), 0);
    const collected = monthRows.reduce((sum, row) => sum + Number(row.amountPaid), 0);

    return {
      month: monthKey,
      billed,
      collected,
      collectionRate: billed > 0 ? Math.round((collected / billed) * 100) : 0,
    };
  });
}

export async function getStudentFeeSummary(
  teacherId: string,
  studentId: string,
): Promise<StudentFeeSummary> {
  const [fees, payments] = await Promise.all([
    getFeesByStudent(teacherId, studentId),
    getPaymentsByStudent(teacherId, studentId),
  ]);

  const totalBilled = fees.reduce((sum, fee) => sum + fee.amount, 0);
  const totalPaid = fees.reduce((sum, fee) => sum + fee.amountPaid, 0);
  const pendingBalance = totalBilled - totalPaid;
  const overdueAmount = fees
    .filter((fee) => fee.status === "overdue")
    .reduce((sum, fee) => sum + (fee.amount - fee.amountPaid), 0);

  let status: StudentFeeSummary["status"] = "paid";
  if (overdueAmount > 0) {
    status = "overdue";
  } else if (pendingBalance > 0) {
    status = fees.some((fee) => fee.status === "partial") ? "partial" : "pending";
  }

  return {
    studentId,
    totalBilled,
    totalPaid,
    pendingBalance,
    overdueAmount,
    status,
    fees,
    payments,
  };
}

// Student x month view for a single batch. Months without a materialized
// Fee row are synthesized (never persisted) so the grid can show a full
// rolling window even before any billing action has touched that month —
// "not_due" for the future, "pending" for an unbilled past/current month.
export async function getBatchFeeGrid(
  teacherId: string,
  batchId: string,
  monthsBack = 6,
): Promise<BatchFeeGridRow[]> {
  const students = await prisma.student.findMany({
    where: { teacherId, batchId },
    orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
  });
  const studentIds = students.map((s) => s.id);

  const fees =
    studentIds.length > 0
      ? await prisma.fee.findMany({
          where: { teacherId, batchId, studentId: { in: studentIds } },
        })
      : [];

  const feesByStudent = new Map<string, Map<string, (typeof fees)[number]>>();
  for (const fee of fees) {
    const byMonth = feesByStudent.get(fee.studentId) ?? new Map();
    byMonth.set(fee.month, fee);
    feesByStudent.set(fee.studentId, byMonth);
  }

  const today = new Date();
  const currentMonthKey = toMonthKey(today);
  const months = Array.from({ length: monthsBack }, (_, i) => {
    const offset = monthsBack - 1 - i;
    return toMonthKey(new Date(today.getFullYear(), today.getMonth() - offset, 1));
  });

  return students.map((student) => {
    const byMonth = feesByStudent.get(student.id) ?? new Map();

    const cells: BatchFeeGridCell[] = months.map((month) => {
      const feeRow = byMonth.get(month);
      if (feeRow) {
        const mapped = mapFee(feeRow);
        return {
          month,
          status: mapped.status,
          feeId: mapped.id,
          amount: mapped.amount,
          amountPaid: mapped.amountPaid,
        };
      }
      return {
        month,
        status: month > currentMonthKey ? "not_due" : "pending",
        feeId: null,
        amount: null,
        amountPaid: null,
      };
    });

    return {
      studentId: student.id,
      studentName: `${student.firstName} ${student.lastName}`.trim(),
      cells,
    };
  });
}
