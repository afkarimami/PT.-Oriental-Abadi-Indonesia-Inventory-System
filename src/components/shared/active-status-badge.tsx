import { CheckCircle2, PauseCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function ActiveStatusBadge({ isActive }: { isActive: boolean }) {
  return isActive ? <Badge className="border-0 bg-[#e6faf2] text-[#167858]"><CheckCircle2 />Aktif</Badge> : <Badge className="border-0 bg-[#f1f4f8] text-muted-foreground"><PauseCircle />Nonaktif</Badge>;
}