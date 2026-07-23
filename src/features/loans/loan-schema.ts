import { z } from "zod";

const requiredText = (message: string) => z.string().trim().min(1, message);

export const createLoanSchema = z.object({
  borrowerName: requiredText("Nama peminjam wajib diisi."),
  borrowerPhone: requiredText("Nomor HP wajib diisi."),
  borrowerOrganization: z.string().trim().optional(),
  purpose: requiredText("Keperluan peminjaman wajib diisi."),
  expectedReturnOn: z.string().optional(),
  notes: z.string().trim().optional(),
  documentationPath: z.string().trim().optional(),
  items: z.array(z.object({
    inventoryItemId: z.string().uuid(),
    quantity: z.number().int().positive(),
  })).min(1, "Pilih minimal satu alat."),
});

export const returnLoanItemSchema = z.object({
  loanItemId: z.string().uuid(),
  quantityGood: z.number().int().min(0),
  quantityDamaged: z.number().int().min(0),
  quantityLost: z.number().int().min(0),
  notes: z.string().trim().optional(),
  documentationPath: z.string().trim().optional(),
}).refine((value) => value.quantityGood + value.quantityDamaged + value.quantityLost > 0, {
  message: "Masukkan jumlah alat yang dikembalikan.",
});

export type CreateLoanValues = z.infer<typeof createLoanSchema>;
export type ReturnLoanItemValues = z.infer<typeof returnLoanItemSchema>;