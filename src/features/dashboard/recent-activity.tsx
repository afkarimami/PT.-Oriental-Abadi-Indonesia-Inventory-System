import { ArchiveRestore, Boxes, MapPinned, PlusCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const activities = [
  { label: "MacBook Pro 14\" ditambahkan", detail: "Oleh Admin Kantor · 10 menit lalu", icon: PlusCircle, tone: "bg-[#edf0ff] text-[#526dff]" },
  { label: "Kamera Sony A7 III dipinjam", detail: "Rizky Maulana · 42 menit lalu", icon: Boxes, tone: "bg-[#fff6df] text-[#c48609]" },
  { label: "Proyektor BenQ dikembalikan", detail: "Dewi Lestari · 1 jam lalu", icon: ArchiveRestore, tone: "bg-[#e8faf4] text-[#269b73]" },
  { label: "Lokasi printer diperbarui", detail: "Lantai 3, Area Finance · 3 jam lalu", icon: MapPinned, tone: "bg-[#f0ecff] text-[#7657d1]" },
];

export function RecentActivity() { return <Card className="border shadow-[0_8px_24px_rgba(28,36,52,0.04)]"><CardHeader className="p-5 pb-3 sm:p-6 sm:pb-3"><CardTitle className="text-lg">Aktivitas terbaru</CardTitle></CardHeader><CardContent className="space-y-5 p-5 pt-3 sm:p-6 sm:pt-3">{activities.map((activity) => { const Icon = activity.icon; return <div key={activity.label} className="flex gap-3"><span className={`grid size-9 shrink-0 place-items-center rounded-xl ${activity.tone}`}><Icon className="size-4" /></span><div><p className="text-sm font-semibold">{activity.label}</p><p className="mt-0.5 text-xs text-muted-foreground">{activity.detail}</p></div></div>; })}</CardContent></Card>; }