"use client";

import { createClient } from "@/lib/supabase/client";

export async function uploadLoanDocumentation(file: File) {
  if (!file.type.startsWith("image/")) throw new Error("Dokumentasi harus berupa gambar.");
  if (file.size > 5 * 1024 * 1024) throw new Error("Ukuran gambar maksimal 5 MB.");

  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = "loans/" + crypto.randomUUID() + "." + extension;
  const supabase = createClient();
  const { error } = await supabase.storage.from("loan-documentation").upload(path, file, { contentType: file.type });
  if (error) throw new Error("Dokumentasi gagal diunggah.");
  return path;
}
