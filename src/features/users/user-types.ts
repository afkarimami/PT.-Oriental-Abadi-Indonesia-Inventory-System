import type { AdminRole } from "@/types";

export type ManagedAccount = {
  id: string;
  fullName: string;
  email: string;
  role: AdminRole;
  isActive: boolean;
  createdAt: string;
  lastSignInAt: string | null;
};

export type UserManagementData = {
  configured: boolean;
  accounts: ManagedAccount[];
};