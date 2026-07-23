import { createClient } from "@/lib/supabase/server";
import type { AdminSummary } from "@/types";

type ProfileRow = {
  full_name: string;
  role: AdminSummary["role"];
  is_active: boolean;
};

export async function getCurrentUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getCurrentAdmin(): Promise<AdminSummary | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role, is_active")
    .eq("id", user.id)
    .maybeSingle<ProfileRow>();

  if (!profile) return null;

  return {
    id: user.id,
    email: user.email,
    fullName: profile.full_name || user.email,
    role: profile.role,
    isActive: profile.is_active,
  };
}
