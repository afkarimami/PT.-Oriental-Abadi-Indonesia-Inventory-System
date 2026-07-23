"use server";

import { redirect } from "next/navigation";
import { loginSchema } from "./auth-schema";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export type AuthActionState = { error?: string };

export async function login(_: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Data login belum lengkap." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { error: "Email atau password tidak valid. Silakan coba lagi." };

  redirect("/");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
export async function activateInvitedAccount(): Promise<AuthActionState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Sesi undangan tidak ditemukan. Buka kembali link dari email." };

  const admin = getSupabaseAdmin();
  if (!admin) return { error: "Sistem belum dapat mengaktifkan akun. Hubungi Super Admin." };

  const { error } = await admin.from("profiles").update({ is_active: true }).eq("id", user.id);
  if (error) return { error: "Password tersimpan, tetapi akun belum dapat diaktifkan. Hubungi Super Admin." };

  return {};
}