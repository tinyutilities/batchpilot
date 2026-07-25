import { prisma } from "@/server/db/prisma";
import { mapFee, mapPayment } from "@/server/fees/mappers";
import { toMonthKey } from "@/lib/utils";
import type {
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

  return Promise.all(
    offsets.map(async (offset) => {
      const monthDate = new Date(today.getFullYear(), today.getMonth() - offset, 1);
      const monthKey = toMonthKey(monthDate);
      const rows = await prisma.fee.findMany({ where: { teacherId, month: monthKey } });
      const billed = rows.reduce((sum, row) => sum + Number(row.amount), 0);
      const collected = rows.reduce((sum, row) => sum + Number(row.amountPaid), 0);

      return {
        month: monthKey,
        billed,
        collected,
        collectionRate: billed > 0 ? Math.round((collected / billed) * 100) : 0,
      };
    }),
  );
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
