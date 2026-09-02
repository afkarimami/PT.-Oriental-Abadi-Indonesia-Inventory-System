import { createClient } from "@supabase/supabase-js";

// Mengambil konfigurasi Supabase dari environment variable
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
// Gunakan ANON_KEY (standar Supabase) atau samakan dengan nama di .env Anda
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";

// Cek apakah key tersedia sebelum inisialisasi untuk mencegah crash saat build
export const supabase = 
  supabaseUrl && supabaseKey 
    ? createClient(supabaseUrl, supabaseKey) 
    : (null as unknown as ReturnType<typeof createClient>);

export async function getLoans() {
  const { data, error } = await supabase
    .from("loans")
    .select("*");

  if (error) throw new Error(error.message);

  return data || [];
}

export async function getOutstandingLoanItems() {
  const { data, error } = await supabase
    .from("loan_items")
    .select("*")
    .eq("status", "outstanding");

  if (error) throw new Error(error.message);

  return data || [];
}

export async function getLoanableItems() {
  const { data, error } = await supabase
    .from("inventory_items")
    .select("*");

  if (error) throw new Error(error.message);

  return data || [];
}

export async function getLoanById(id: string) {
  const { data, error } = await supabase
    .from("loans")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw new Error(error.message);

  return data;
}