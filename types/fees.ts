// types/fees.ts

export type FeeStatus = "paid" | "partial" | "pending" | "overdue" | "not_due";

export type PaymentMethod =
  | "cash"
  | "upi"
  | "bank_transfer"
  | "card"
  | "cheque";

export interface FeeRecord {
  id: string;
  studentId: string;
  batchId: string;
  month: string;
  amount: number;
  amountPaid: number;
  dueDate: string;
  status: FeeStatus;
  createdAt: string;
}

export interface Payment {
  id: string;
  feeId: string;
  studentId: string;
  amount: number;
  method: PaymentMethod;
  date: string;
  referenceNumber?: string;
  notes?: string;
  createdAt: string;
}

export interface PaymentInput {
  amount: number;
  method: PaymentMethod;
  date: string;
  referenceNumber?: string;
  notes?: string;
}

export interface FeeStatsData {
  totalCollected: number;
  pendingAmount: number;
  overdueAmount: number;
  studentsPaid: number;
  studentsPending: number;
  collectionRate: number;
}

export interface FeeStatsProps {
  stats: FeeStatsData;
}

export interface MonthlyCollectionStats {
  month: string;
  billed: number;
  collected: number;
  collectionRate: number;
}

export interface StudentFeeSummary {
  studentId: string;
  totalBilled: number;
  totalPaid: number;
  pendingBalance: number;
  overdueAmount: number;
  status: FeeStatus;
  fees: FeeRecord[];
  payments: Payment[];
}

export interface BatchFeeSummary {
  batchId: string;
  totalBilled: number;
  totalCollected: number;
  pendingAmount: number;
  studentsCount: number;
  studentsPaidCount: number;
}

export type FeeSortOption =
  | "dueDate-asc"
  | "dueDate-desc"
  | "amount-desc"
  | "amount-asc"
  | "balance-desc"
  | "name-asc";

export interface FeeFilter {
  search: string;
  batchId: string | "all";
  status: FeeStatus | "all";
  month: string | "all";
}

export interface FeeTableRow {
  fee: FeeRecord;
  studentId: string;
  studentName: string;
  batchName: string;
}

export interface BatchFeeGridCell {
  month: string;
  status: FeeStatus;
  // null until a Fee row has actually been materialized for this student+month.
  feeId: string | null;
  amount: number | null;
  amountPaid: number | null;
}

export interface BatchFeeGridRow {
  studentId: string;
  studentName: string;
  cells: BatchFeeGridCell[];
}
