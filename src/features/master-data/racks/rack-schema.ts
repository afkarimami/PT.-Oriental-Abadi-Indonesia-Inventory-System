import { z } from "zod";

const normalize = (value: string) => value.trim().replace(/\s+/g, " ");

export const rackSchema = z.object({
  code: z.string().transform((value) => normalize(value).toUpperCase()).pipe(z.string().min(1, "Kode rak wajib diisi.")),
  name: z.string().transform(normalize).pipe(z.string().min(2, "Nama rak minimal terdiri dari 2 karakter.")),
  description: z.string().transform(normalize).transform((value) => value || null),
  is_active: z.boolean(),
});

export type RackValues = z.infer<typeof rackSchema>;