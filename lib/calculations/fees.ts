import type {
  FeeRecord,
  FeeStatsData,
  FeeStatus,
  MonthlyCollectionStats,
} from "@/types/fees";
import { toMonthKey } from "@/lib/utils";

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cash: "Cash",
  upi: "UPI",
  bank_transfer: "Bank Transfer",
  card: "Card",
  cheque: "Cheque",
};

export function formatPaymentMethod(method: string): string {
  return PAYMENT_METHOD_LABELS[method] ?? method;
}

export function monthLabel(monthKey: string): string {
  const [year, month] = monthKey.split("-").map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });
}

function startOfToday(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

// Status is always recomputed from amount/amountPaid/dueDate rather than
// trusted from storage, so "overdue" stays accurate as days pass without
// needing a cron-style recompute job.
export function computeFeeStatus(fee: {
  amount: number;
  amountPaid: number;
  dueDate: string;
}): FeeStatus {
  const isOverdue = new Date(fee.dueDate).getTime() < startOfToday().getTime();

  if (fee.amountPaid >= fee.amount) return "paid";
  if (fee.amountPaid > 0) return isOverdue ? "overdue" : "partial";
  return isOverdue ? "overdue" : "pending";
}

export function computeFeeStats(fees: FeeRecord[]): FeeStatsData {
  const totalBilled = fees.reduce((sum, fee) => sum + fee.amount, 0);
  const totalCollected = fees.reduce((sum, fee) => sum + fee.amountPaid, 0);
  const pendingAmount = fees
    .filter((fee) => fee.status !== "paid")
    .reduce((sum, fee) => sum + (fee.amount - fee.amountPaid), 0);
  const overdueAmount = fees
    .filter((fee) => fee.status === "overdue")
    .reduce((sum, fee) => sum + (fee.amount - fee.amountPaid), 0);

  const paidStudentIds = new Set(
    fees.filter((fee) => fee.status === "paid").map((fee) => fee.studentId),
  );
  const pendingStudentIds = new Set(
    fees.filter((fee) => fee.status !== "paid").map((fee) => fee.studentId),
  );

  return {
    totalCollected,
    pendingAmount,
    overdueAmount,
    studentsPaid: paidStudentIds.size,
    studentsPending: pendingStudentIds.size,
    collectionRate:
      totalBilled > 0 ? Math.round((totalCollected / totalBilled) * 100) : 0,
  };
}

export function computeMonthlyCollectionStats(
  fees: FeeRecord[],
  monthsBack = 6,
): MonthlyCollectionStats[] {
  const today = new Date();
  const results: MonthlyCollectionStats[] = [];

  for (let offset = monthsBack - 1; offset >= 0; offset--) {
    const monthDate = new Date(today.getFullYear(), today.getMonth() - offset, 1);
    const monthKey = toMonthKey(monthDate);
    const monthFees = fees.filter((fee) => fee.month === monthKey);
    const billed = monthFees.reduce((sum, fee) => sum + fee.amount, 0);
    const collected = monthFees.reduce((sum, fee) => sum + fee.amountPaid, 0);

    results.push({
      month: monthKey,
      billed,
      collected,
      collectionRate: billed > 0 ? Math.round((collected / billed) * 100) : 0,
    });
  }

  return results;
}
