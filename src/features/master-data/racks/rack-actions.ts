"use server";

import { revalidatePath } from "next/cache";
import { getCurrentAdmin } from "@/features/auth/auth-queries";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "../master-data-types";
import { rackSchema, type RackValues } from "./rack-schema";

const paths = ["/inventory", "/master-data/racks"];
const refresh = () => paths.forEach((path) => revalidatePath(path));

async function canMutate(): Promise<ActionResult | null> {
  const admin = await getCurrentAdmin();
  return admin?.isActive ? null : { success: false, message: "Akun Anda tidak aktif atau sesi telah berakhir." };
}

function result(error: { code?: string } | null, message: string): ActionResult {
  if (!error) return { success: true, message };
  if (error.code === "23505") return { success: false, message: "Kode rak sudah digunakan." };
  return { success: false, message: "Data gagal disimpan. Silakan coba kembali." };
}

function validate(input: unknown) {
  const parsed = rackSchema.safeParse(input);
  return parsed.success ? parsed : null;
}

export async function createRack(input: RackValues): Promise<ActionResult> {
  const permission = await canMutate();
  if (permission) return permission;
  const parsed = validate(input);
  if (!parsed) return { success: false, message: "Data rak tidak valid." };

  const supabase = await createClient();
  const { error } = await supabase.from("racks").insert(parsed.data);
  const actionResult = result(error, "Rak berhasil ditambahkan.");
  if (actionResult.success) refresh();
  return actionResult;
}
export async function updateRack(id: string, input: RackValues): Promise<ActionResult> {
  const permission = await canMutate();
  if (permission) return permission;
  const parsed = validate(input);
  if (!parsed) return { success: false, message: "Data rak tidak valid." };

  const supabase = await createClient();
  const { error } = await supabase.from("racks").update(parsed.data).eq("id", id);
  const actionResult = result(error, "Rak berhasil diperbarui.");
  if (actionResult.success) refresh();
  return actionResult;
}

export async function toggleRackStatus(id: string, isActive: boolean): Promise<ActionResult> {
  const permission = await canMutate();
  if (permission) return permission;
  const supabase = await createClient();
  const { error } = await supabase.from("racks").update({ is_active: isActive }).eq("id", id);
  const actionResult = result(error, isActive ? "Rak berhasil diaktifkan kembali." : "Rak berhasil dinonaktifkan.");
  if (actionResult.success) refresh();
  return actionResult;
}