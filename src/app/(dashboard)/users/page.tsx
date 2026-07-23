import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/features/auth/auth-queries";
import { getUserManagementData } from "@/features/users/user-queries";
import { UserManagementPage } from "@/features/users/user-management-page";

export default async function UsersRoute() {
  const admin = await getCurrentAdmin();
  if (!admin?.isActive || admin.role !== "super_admin") redirect("/");
  const data = await getUserManagementData();
  return <UserManagementPage data={data} admin={admin} />;
}