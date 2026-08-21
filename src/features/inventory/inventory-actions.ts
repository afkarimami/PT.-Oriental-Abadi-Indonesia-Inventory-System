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

  try {
    // Memanggil fungsi Supabase untuk mencatat barang
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

    if (error) {
      // Menangkap error duplikat nama barang (kode PostgreSQL 23505 atau pesan unique constraint)
      if (error.code === "23505" || error.message.includes("unique_inventory_item_name")) {
        return { 
          success: false, 
          message: "Nama barang sudah ada, silakan gunakan nama lain." 
        };
      }
      return { success: false, message: error.message || "Barang masuk gagal dicatat." };
    }

// Refresh halaman global & dinamis agar stok di dalam rak langsung ter-update
// Refresh semua halaman utama dan detail rak
revalidatePath("/", "layout");
revalidatePath("/inventory", "layout");
revalidatePath("/inventory/racks", "layout");

return { 
  success: true, 
  message: data.mode === "new" 
    ? "Barang baru berhasil dibuat dan stok dicatat." 
    : "Barang masuk berhasil dicatat dan stok diperbarui." 
};

    return { 
      success: true, 
      message: data.mode === "new" 
        ? "Barang baru berhasil dibuat dan stok awal dicatat." 
        : "Barang masuk berhasil dicatat dan stok diperbarui." 
    };
  } catch (err) {
    return { success: false, message: "Terjadi kesalahan pada server." };
  }
}