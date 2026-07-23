import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { EquipmentStatus } from "@/types";

const statusStyles: Record<EquipmentStatus, string> = {
  Dipinjam: "bg-[#fff5db] text-[#a66d00] hover:bg-[#fff0c5]",
  Tersedia: "bg-[#e6faf2] text-[#167858] hover:bg-[#d8f6ea]",
  Terlambat: "bg-[#fff0ef] text-[#c74e4c] hover:bg-[#ffe2e0]",
};

export function StatusBadge({ status }: { status: EquipmentStatus }) {
  return <Badge className={cn("border-0 px-2.5 py-1 font-semibold", statusStyles[status])}>{status}</Badge>;
}