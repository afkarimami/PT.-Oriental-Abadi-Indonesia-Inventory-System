import { z } from "zod";

export const inviteUserSchema = z.object({
  fullName: z.string().trim().min(2, "Nama minimal 2 karakter."),
  email: z.string().trim().email("Masukkan email yang valid."),
  role: z.enum(["super_admin", "inventory_admin", "viewer"]),
});

export type InviteUserValues = z.infer<typeof inviteUserSchema>;