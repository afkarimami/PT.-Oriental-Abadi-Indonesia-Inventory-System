"use server";

import { revalidatePath } from "next/cache";
import { getCurrentAdmin } from "@/features/auth/auth-queries";
import { createClient } from "@/lib/supabase/server";
import { stockReceiptSchema, type StockReceiptValues } from "./inventory-schema";

type StockReceiptResult = { success: boolean; message: string };

export async function receiveStock(input: StockReceiptValues): Promise<StockReceiptResult> {
  const admin = await getCurrentAdmin();
  if (!admin?.isActive) return { success: false, message: "Akun Anda tidak aktif atau sesi telah berakhir." };

  const parsed = stockReceiptSchema.safeParse(input);
  if (!parsed.success) return { success: false, message: parsed.error.issues[0]?.message ?? "Data barang masuk tidak valid." };

  const { data } = parsed;
  const supabase = await createClient();
  const { error } = await supabase.rpc("receive_stock", {
    p_mode: data.mode,
    p_inventory_item_id: data.existingItemId ?? null,
    p_rack_id: data.rackId ?? null,
    p_code: data.code ?? "",
    p_name: data.name ?? "",
    p_item_type: data.itemType ?? "inventory",
    p_quantity: data.quantity,
    p_notes: data.notes ?? "",
  });

  if (error) return { success: false, message: error.message || "Barang masuk gagal dicatat." };
  ["/", "/inventory", "/reports"].forEach((path) => revalidatePath(path));
  return { success: true, message: data.mode === "new" ? "Barang baru berhasil dibuat dan stok awal dicatat." : "Barang masuk berhasil dicatat dan stok diperbarui." };
}
