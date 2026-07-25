import type {
  Fee as PrismaFee,
  Payment as PrismaPayment,
  PaymentMethod as PrismaPaymentMethod,
} from "@prisma/client";
import type { FeeRecord, Payment, PaymentMethod } from "@/types/fees";
import { computeFeeStatus } from "@/lib/calculations/fees";
import { toDateKey } from "@/lib/utils";

const METHOD_TO_UI: Record<PrismaPaymentMethod, PaymentMethod> = {
  CASH: "cash",
  UPI: "upi",
  BANK_TRANSFER: "bank_transfer",
  CARD: "card",
  CHEQUE: "cheque",
};

const METHOD_TO_PRISMA: Record<PaymentMethod, PrismaPaymentMethod> = {
  cash: "CASH",
  upi: "UPI",
  bank_transfer: "BANK_TRANSFER",
  card: "CARD",
  cheque: "CHEQUE",
};

export function paymentMethodToUI(method: PrismaPaymentMethod): PaymentMethod {
  return METHOD_TO_UI[method];
}

export function paymentMethodToPrisma(method: PaymentMethod): PrismaPaymentMethod {
  return METHOD_TO_PRISMA[method];
}

export function mapFee(row: PrismaFee): FeeRecord {
  const amount = Number(row.amount);
  const amountPaid = Number(row.amountPaid);
  const dueDate = toDateKey(row.dueDate);

  return {
    id: row.id,
    studentId: row.studentId,
    batchId: row.batchId,
    month: row.month,
    amount,
    amountPaid,
    dueDate,
    status: computeFeeStatus({ amount, amountPaid, dueDate }),
    createdAt: row.createdAt.toISOString(),
  };
}

export function mapPayment(row: PrismaPayment): Payment {
  return {
    id: row.id,
    feeId: row.feeId,
    studentId: row.studentId,
    amount: Number(row.amount),
    method: paymentMethodToUI(row.method),
    date: toDateKey(row.date),
    referenceNumber: row.referenceNumber ?? undefined,
    notes: row.notes ?? undefined,
    createdAt: row.createdAt.toISOString(),
  };
}
