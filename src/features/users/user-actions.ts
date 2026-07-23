"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import type { AdminRole } from "@/types";
import { getCurrentAdmin } from "@/features/auth/auth-queries";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { inviteUserSchema } from "./user-schema";

type UserActionResult = { success: boolean; message: string };

async function requireSuperAdmin(): Promise<{ id: string } | UserActionResult> {
  const admin = await getCurrentAdmin();
  if (!admin || !admin.isActive || admin.role !== "super_admin") return { success: false, message: "Hanya Super Admin yang dapat mengelola akun." };
  return { id: admin.id };
}

function getAdminClient(): { client: NonNullable<ReturnType<typeof getSupabaseAdmin>> } | UserActionResult {
  const client = getSupabaseAdmin();
  if (!client) return { success: false, message: "Service-role key belum diatur. Tambahkan SUPABASE_SERVICE_ROLE_KEY di .env.local." };
  return { client };
}

async function keepAtLeastOneSuperAdmin(client: NonNullable<ReturnType<typeof getSupabaseAdmin>>, targetId: string, nextRole?: AdminRole, nextActive?: boolean): Promise<UserActionResult | null> {
  const { data: target, error } = await client.from("profiles").select("role, is_active").eq("id", targetId).maybeSingle();
  if (error || !target) return { success: false, message: "Akun tidak ditemukan." };
  const removesSuperAdmin = target.role === "super_admin" && (nextRole !== undefined && nextRole !== "super_admin" || nextActive === false);
  if (!removesSuperAdmin) return null;

  const { count } = await client.from("profiles").select("id", { count: "exact", head: true }).eq("role", "super_admin").eq("is_active", true);
  return (count ?? 0) <= 1 ? { success: false, message: "Minimal harus ada satu Super Admin aktif." } : null;
}

export async function inviteUser(input: unknown): Promise<UserActionResult> {
  const current = await requireSuperAdmin();
  if ("success" in current) return current;
  const setup = getAdminClient();
  if ("success" in setup) return setup;
  const parsed = inviteUserSchema.safeParse(input);
  if (!parsed.success) return { success: false, message: parsed.error.issues[0]?.message ?? "Data akun tidak valid." };

  const { data: existingUsers, error: existingUsersError } = await setup.client.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (existingUsersError) return { success: false, message: "Daftar akun belum dapat diperiksa. Silakan coba lagi." };

  const existingUser = existingUsers.users.find((user) => user.email?.toLowerCase() === parsed.data.email.toLowerCase());
  if (existingUser) {
    const { data: existingProfile } = await setup.client.from("profiles").select("is_active").eq("id", existingUser.id).maybeSingle();
    return {
      success: false,
      message: existingProfile?.is_active
        ? "Email ini sudah memiliki akun aktif. Gunakan akun yang sudah ada."
        : "Email ini sudah memiliki undangan yang menunggu aktivasi. Hapus akun tersebut dahulu jika ingin mengirim undangan baru.",
    };
  }
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "http";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? `${protocol}://${host}`;
  const { data, error } = await setup.client.auth.admin.inviteUserByEmail(parsed.data.email, { data: { full_name: parsed.data.fullName }, redirectTo: `${siteUrl}/activate-account` });
  if (error || !data.user) {
    const errorMessage = error?.message ?? "";
    if (errorMessage.toLowerCase().includes("rate limit")) return { success: false, message: "Email belum dapat dikirim karena terlalu banyak percobaan. Tunggu sekitar satu menit, lalu coba lagi." };
    if (errorMessage.toLowerCase().includes("redirect")) return { success: false, message: "Alamat halaman aktivasi belum diizinkan di Supabase. Periksa Redirect URLs pada Authentication." };
    if (errorMessage.toLowerCase().includes("already registered")) return { success: false, message: "Email ini sudah terdaftar." };
    return { success: false, message: `Undangan akun gagal dikirim: ${errorMessage || "silakan coba lagi."}` };
  }

  const { error: profileError } = await setup.client.from("profiles").upsert({ id: data.user.id, full_name: parsed.data.fullName, role: parsed.data.role, is_active: false });
  if (profileError) return { success: false, message: "Undangan terkirim, tetapi profil akun belum dapat disiapkan." };

  revalidatePath("/users");
  return { success: true, message: "Undangan akun berhasil dikirim." };
}

export async function updateUserRole(userId: string, role: AdminRole): Promise<UserActionResult> {
  const current = await requireSuperAdmin();
  if ("success" in current) return current;
  if (current.id === userId) return { success: false, message: "Peran akun sendiri tidak dapat diubah dari halaman ini." };
  const setup = getAdminClient();
  if ("success" in setup) return setup;
  const safeguard = await keepAtLeastOneSuperAdmin(setup.client, userId, role);
  if (safeguard) return safeguard;

  const { error } = await setup.client.from("profiles").update({ role }).eq("id", userId);
  if (error) return { success: false, message: "Peran akun gagal diperbarui." };
  revalidatePath("/users");
  return { success: true, message: "Peran akun diperbarui." };
}

export async function deleteUserAccount(userId: string): Promise<UserActionResult> {
  const current = await requireSuperAdmin();
  if ("success" in current) return current;
  if (current.id === userId) return { success: false, message: "Akun sendiri tidak dapat dihapus." };
  const setup = getAdminClient();
  if ("success" in setup) return setup;
  const safeguard = await keepAtLeastOneSuperAdmin(setup.client, userId, undefined, false);
  if (safeguard) return safeguard;

  const [loans, returns, stockMovements] = await Promise.all([
    setup.client.from("loans").select("id", { count: "exact", head: true }).eq("created_by", userId),
    setup.client.from("loan_item_returns").select("id", { count: "exact", head: true }).eq("recorded_by", userId),
    setup.client.from("stock_movements").select("id", { count: "exact", head: true }).eq("recorded_by", userId),
  ]);
  if (loans.error || returns.error || stockMovements.error) return { success: false, message: "Riwayat akun belum dapat diperiksa." };
  if ((loans.count ?? 0) + (returns.count ?? 0) + (stockMovements.count ?? 0) > 0) return { success: false, message: "Akun memiliki riwayat transaksi. Nonaktifkan saja agar laporan tetap valid." };

  const { error } = await setup.client.auth.admin.deleteUser(userId);
  if (error) return { success: false, message: "Akun gagal dihapus. Silakan coba lagi." };
  revalidatePath("/users");
  return { success: true, message: "Akun dihapus permanen. Email ini dapat diundang kembali." };
}

export async function updateUserActive(userId: string, isActive: boolean): Promise<UserActionResult> {
  const current = await requireSuperAdmin();
  if ("success" in current) return current;
  if (current.id === userId) return { success: false, message: "Akun sendiri tidak dapat dinonaktifkan." };
  const setup = getAdminClient();
  if ("success" in setup) return setup;
  const safeguard = await keepAtLeastOneSuperAdmin(setup.client, userId, undefined, isActive);
  if (safeguard) return safeguard;

  const { error } = await setup.client.from("profiles").update({ is_active: isActive }).eq("id", userId);
  if (error) return { success: false, message: "Status akun gagal diperbarui." };
  revalidatePath("/users");
  return { success: true, message: isActive ? "Akun diaktifkan." : "Akun dinonaktifkan." };
}