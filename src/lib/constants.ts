import { Archive, BarChart3, ClipboardCheck, LayoutDashboard, Rows3, type LucideIcon } from "lucide-react";

type NavigationItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  children?: NavigationItem[];
};

export const navigationItems: NavigationItem[] = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Inventory", href: "/inventory", icon: Archive },
  { label: "Transaksi Alat", href: "/loans", icon: ClipboardCheck },
  { label: "Laporan", href: "/reports", icon: BarChart3 },
  { label: "Rak", href: "/master-data/racks", icon: Rows3 },
];