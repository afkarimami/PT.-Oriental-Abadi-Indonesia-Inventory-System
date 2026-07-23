import { z } from "zod";

export const stockReceiptSchema = z.object({
  mode: z.enum(["existing", "new"]),
  existingItemId: z.string().uuid().optional(),
  rackId: z.string().uuid().optional(),
  code: z.string().trim().max(80).optional(),
  name: z.string().trim().max(160).optional(),
  itemType: z.enum(["inventory", "consumable"]).optional(),
  quantity: z.coerce.number().int().positive(),
  notes: z.string().trim().max(500).optional(),
}).superRefine((value, context) => {
  if (value.mode === "existing" && !value.existingItemId) context.addIssue({ code: "custom", path: ["existingItemId"], message: "Pilih barang yang akan ditambah stoknya." });
  if (value.mode === "new") {
    if (!value.rackId) context.addIssue({ code: "custom", path: ["rackId"], message: "Pilih rak untuk barang baru." });
    if (!value.name) context.addIssue({ code: "custom", path: ["name"], message: "Nama barang baru wajib diisi." });
    if (!value.itemType) context.addIssue({ code: "custom", path: ["itemType"], message: "Pilih jenis barang." });
  }
});

export type StockReceiptValues = z.infer<typeof stockReceiptSchema>;
