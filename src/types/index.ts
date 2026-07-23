export type EquipmentStatus = "Dipinjam" | "Tersedia" | "Terlambat";

export type ActiveEquipment = {
  name: string;
  code: string;
  borrower: string;
  purpose: string;
  location: string;
  returnDate: string;
  status: EquipmentStatus;
};

export type AdminRole = "super_admin" | "inventory_admin" | "viewer";

export type AdminSummary = {
  id: string;
  fullName: string;
  email: string;
  role: AdminRole;
  isActive: boolean;
};