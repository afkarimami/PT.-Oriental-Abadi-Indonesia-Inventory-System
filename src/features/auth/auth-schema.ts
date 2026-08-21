import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().email("Masukkan alamat email yang valid."),
  password: z.string().min(1, "Password wajib diisi."),
});

export type LoginValues = z.infer<typeof loginSchema>; 