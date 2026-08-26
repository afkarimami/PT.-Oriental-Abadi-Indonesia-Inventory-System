"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// 1. Action untuk Membuat Peminjaman Baru
export async function createLoan(formData: FormData) {
  const supabase = await createClient();

  const borrowerName = formData.get("borrowerName")?.toString();
  const borrowerPhone = formData.get("borrowerPhone")?.toString();
  const borrowerOrganization = formData.get("borrowerOrganization")?.toString() || "";
  const purpose = formData.get("purpose")?.toString();
  const expectedReturnOn = formData.get("expectedReturnOn")?.toString() || null;
  const itemsJson = formData.get("items")?.toString();

  if (!borrowerName || !borrowerPhone || !purpose || !itemsJson) {
    return { success: false, error: "Mohon lengkapi semua data wajib." };
  }

  let items: { inventoryItemId: string; quantity: number }[] = [];
  try {
    items = JSON.parse(itemsJson);
  } catch {
    return { success: false, error: "Format data barang tidak valid." };
  }

  if (items.length === 0) {
    return { success: false, error: "Pilih minimal satu barang untuk dipinjam." };
  }

  const { data: loan, error: loanError } = await supabase
    .from("loans")
    .insert({
      borrower_name: borrowerName,
      borrower_phone: borrowerPhone,
      borrower_organization: borrowerOrganization,
      purpose,
      expected_return_on: expectedReturnOn,
      status: "active",
    })
    .select("id")
    .single();

  if (loanError || !loan) {
    return { success: false, error: loanError?.message || "Gagal membuat peminjaman." };
  }

  const loanItems = items.map((item) => ({
    loan_id: loan.id,
    inventory_item_id: item.inventoryItemId,
    quantity_borrowed: item.quantity,
    quantity_returned: 0,
    quantity_damaged: 0,
    quantity_lost: 0,
  }));

  const { error: itemsError } = await supabase.from("loan_items").insert(loanItems);

  if (itemsError) {
    return { success: false, error: itemsError.message };
  }

  revalidatePath("/loans");
  revalidatePath("/inventory");

  return { success: true };
}

// 2. Action untuk Pengembalian Barang
export async function returnLoanItem(formData: FormData) {
  const supabase = await createClient();

  const loanItemId = formData.get("loanItemId")?.toString();
  const quantityGood = Number(formData.get("quantityGood") || 0);
  const quantityDamaged = Number(formData.get("quantityDamaged") || 0);
  const quantityLost = Number(formData.get("quantityLost") || 0);
  const notes = formData.get("notes")?.toString() || "";

  if (!loanItemId) {
    return { success: false, error: "ID Item Peminjaman tidak valid." };
  }

  const { error } = await supabase.rpc("return_loan_item", {
    p_loan_item_id: loanItemId,
    p_quantity_good: quantityGood,
    p_quantity_damaged: quantityDamaged,
    p_quantity_lost: quantityLost,
    p_notes: notes,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  const { data: itemData } = await supabase
    .from("loan_items")
    .select("loan_id")
    .eq("id", loanItemId)
    .single();

  if (itemData?.loan_id) {
    await supabase
      .from("loans")
      .update({ status: "closed", closed_at: new Date().toISOString() })
      .eq("id", itemData.loan_id);
  }

  revalidatePath("/loans");
  revalidatePath("/inventory");

  return { success: true };
}

export const returnLoanItemAction = returnLoanItem;