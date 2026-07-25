"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import FeeForm from "@/components/fees/FeeForm";
import { monthLabel } from "@/lib/calculations/fees";
import type { FeeRecord, PaymentInput } from "@/types/fees";

interface PaymentDialogProps {
  fee: FeeRecord | null;
  studentName: string;
  onOpenChange: (open: boolean) => void;
  onSubmit: (input: PaymentInput) => void;
  isSubmitting?: boolean;
}

export default function PaymentDialog({
  fee,
  studentName,
  onOpenChange,
  onSubmit,
  isSubmitting = false,
}: PaymentDialogProps) {
  return (
    <Dialog open={fee !== null} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
          <DialogDescription>
            {fee ? `${studentName} — ${monthLabel(fee.month)}` : ""}
          </DialogDescription>
        </DialogHeader>
        {fee && (
          <FeeForm
            fee={fee}
            isSubmitting={isSubmitting}
            onSubmit={onSubmit}
            onCancel={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
