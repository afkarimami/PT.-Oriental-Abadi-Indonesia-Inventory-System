import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { getCurrentAdmin, getCurrentUser } from "@/features/auth/auth-queries";

export default async function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    const user = await getCurrentUser();
    redirect(user ? "/login?error=access" : "/login");
  }
  if (!admin.isActive) redirect("/login?error=inactive");
  return <DashboardShell admin={admin}>{children}</DashboardShell>;
}