import { redirect } from "next/navigation";
import { LoginForm } from "@/features/auth/login-form";
import { getCurrentAdmin } from "@/features/auth/auth-queries";

type LoginPageProps = { searchParams: Promise<{ error?: string }> };

const messages: Record<string, string> = {
  inactive: "Akun Anda sedang tidak aktif. Hubungi administrator.",
  access: "Profil akun belum siap. Hubungi administrator.",
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const [admin, params] = await Promise.all([getCurrentAdmin(), searchParams]);
  if (admin?.isActive) redirect("/");
  return <LoginForm initialError={messages[params.error ?? ""] ?? (admin ? messages.inactive : undefined)} />;
}