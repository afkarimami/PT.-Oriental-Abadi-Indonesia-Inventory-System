import type { AdminRole } from "@/types";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { ManagedAccount, UserManagementData } from "./user-types";

type ProfileRow = { id: string; full_name: string; role: AdminRole; is_active: boolean; created_at: string };

export async function getUserManagementData(): Promise<UserManagementData> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return { configured: false, accounts: [] };

  const [{ data: authData, error: authError }, { data: profiles, error: profileError }] = await Promise.all([
    supabase.auth.admin.listUsers({ page: 1, perPage: 1000 }),
    supabase.from("profiles").select("id, full_name, role, is_active, created_at"),
  ]);
  if (authError || profileError) throw new Error("Data pengguna tidak dapat dimuat.");

  const profileById = new Map((profiles as ProfileRow[]).map((profile) => [profile.id, profile]));
  const accounts: ManagedAccount[] = authData.users.map((user) => {
    const profile = profileById.get(user.id);
    return {
      id: user.id,
      fullName: profile?.full_name || user.user_metadata?.full_name || user.email || "Pengguna baru",
      email: user.email || "Email belum tersedia",
      role: profile?.role || "viewer",
      isActive: profile?.is_active ?? false,
      createdAt: profile?.created_at || user.created_at,
      lastSignInAt: user.last_sign_in_at ?? null,
    };
  });

  return { configured: true, accounts: accounts.sort((first, second) => first.fullName.localeCompare(second.fullName, "id")) };
}