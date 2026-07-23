"use server";

import { revalidatePath } from "next/cache";
import { getCurrentAdmin } from "@/features/auth/auth-queries";
import { createClient } from "@/lib/supabase/server";
import { createLoanSchema, returnLoanItemSchema, type CreateLoanValues, type ReturnLoanItemValues } from "./loan-schema";

type ActionResult = { success: boolean; message: string; loanId?: string };

function refresh(loanId?: string) {
  ["/", "/inventory", "/loans"].forEach((path) => revalidatePath(path));
  if (loanId) revalidatePath("/loans/" + loanId);
}

async function canMutate(): Promise<ActionResult | null> {
  const admin = await getCurrentAdmin();
  return admin?.isActive ? null : { success: false, message: "Akun Anda tidak aktif atau sesi telah berakhir." };
}

export async function createLoan(input: CreateLoanValues): Promise<ActionResult> {
  const permission = await canMutate();
  if (permission) return permission;
  const parsed = createLoanSchema.safeParse(input);
  if (!parsed.success) return { success: false, message: parsed.error.issues[0]?.message ?? "Data peminjaman tidak valid." };

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("create_loan", {
    p_borrower_name: parsed.data.borrowerName,
    p_borrower_phone: parsed.data.borrowerPhone,
    p_borrower_organization: parsed.data.borrowerOrganization ?? "",
    p_purpose: parsed.data.purpose,
    p_expected_return_on: parsed.data.expectedReturnOn || null,
    p_notes: parsed.data.notes ?? "",
    p_documentation_path: parsed.data.documentationPath ?? "",
    p_items: parsed.data.items.map((item) => ({ inventory_item_id: item.inventoryItemId, quantity: item.quantity })),
  });
  if (error) return { success: false, message: error.message.includes("Stok") ? error.message : "Peminjaman gagal dicatat. Periksa kembali data dan stok alat." };

  refresh(data);
  return { success: true, message: "Peminjaman berhasil dicatat dan stok alat diperbarui.", loanId: data };
}

export async function returnLoanItem(input: ReturnLoanItemValues, loanId: string): Promise<ActionResult> {
  const permission = await canMutate();
  if (permission) return permission;
  const parsed = returnLoanItemSchema.safeParse(input);
  if (!parsed.success) return { success: false, message: parsed.error.issues[0]?.message ?? "Data pengembalian tidak valid." };

  const supabase = await createClient();
  const { error } = await supabase.rpc("return_loan_item", {
    p_loan_item_id: parsed.data.loanItemId,
    p_quantity_good: parsed.data.quantityGood,
    p_quantity_damaged: parsed.data.quantityDamaged,
    p_quantity_lost: parsed.data.quantityLost,
    p_notes: parsed.data.notes ?? "",
    p_documentation_path: parsed.data.documentationPath ?? "",
  });
  if (error) return { success: false, message: error.message.includes("Jumlah") ? error.message : "Pengembalian gagal dicatat." };

  refresh(loanId);
  return { success: true, message: "Pengembalian selesai dan stok tersedia telah diperbarui." };
}