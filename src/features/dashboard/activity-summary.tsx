import Link from "next/link";
import { CheckCircle2, Handshake, PackagePlus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardInventoryOverview } from "./dashboard-queries";

export function ActivitySummary({ overview }: { overview: DashboardInventoryOverview }) {
  const items = [
    { label: "Barang masuk", count: overview.recentStockInCount, icon: PackagePlus, href: "/reports", className: "bg-sky-50 text-sky-700" },
    { label: "Sedang dipinjam", count: overview.activeLoanCount, icon: Handshake, href: "/loans", className: "bg-amber-50 text-amber-700" },
    { label: "Baru dikembalikan", count: overview.recentReturnCount, icon: CheckCircle2, href: "/loans?view=history", className: "bg-emerald-50 text-emerald-700" },
  ];
  return <Card className="border shadow-[0_8px_24px_rgba(28,36,52,0.04)]"><CardHeader className="p-5 pb-3"><CardTitle className="text-lg">Ringkasan aktivitas</CardTitle><p className="mt-1 text-sm text-muted-foreground">Kelompok aktivitas inventaris.</p></CardHeader><CardContent className="space-y-3 p-5 pt-2">{items.map((item) => { const Icon = item.icon; return <Link key={item.label} href={item.href} className="flex items-center gap-3 rounded-xl border p-3 transition hover:border-primary/30 hover:bg-muted/40"><span className={`grid size-10 place-items-center rounded-xl ${item.className}`}><Icon className="size-5" /></span><div className="min-w-0 flex-1"><p className="text-sm font-semibold">{item.label}</p><p className="mt-0.5 text-xs text-muted-foreground">Lihat detail aktivitas</p></div><strong className="text-xl">{item.count}</strong></Link>; })}</CardContent></Card>;
}