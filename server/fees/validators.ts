import { z } from "zod";

export const paymentInputSchema = z.object({
  amount: z.number().positive(),
  method: z.enum(["cash", "upi", "bank_transfer", "card", "cheque"]),
  date: z.string().min(1),
  referenceNumber: z.string().max(100).optional(),
  notes: z.string().max(500).optional(),
});
