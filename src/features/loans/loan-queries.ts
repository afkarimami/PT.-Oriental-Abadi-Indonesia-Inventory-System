import { createClient } from "@supabase/supabase-js";

// Mengambil konfigurasi server kantor dari file .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const supabase = createClient(supabaseUrl, supabaseKey);

export async function getLoans() {
  const { data, error } = await supabase.from("loans").select("*");
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
  const { data, error } = await supabase.from("items").select("*");
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