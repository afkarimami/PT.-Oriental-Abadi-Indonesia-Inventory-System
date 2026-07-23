import Link from "next/link";
import { CheckCircle2, Handshake, PackagePlus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardActivity, DashboardInventoryOverview } from "./dashboard-queries";

const activityStyles = {
  stock_in: { label: "Barang masuk", icon: PackagePlus, className: "bg-sky-50 text-sky-900", iconClassName: "text-sky-700" },
  loan: { label: "Dipinjam", icon: Handshake, className: "bg-amber-50 text-amber-950", iconClassName: "text-amber-700" },
  return: { label: "Dikembalikan", icon: CheckCircle2, className: "bg-emerald-50 text-emerald-950", iconClassName: "text-emerald-700" },
};

function ActivityItem({ activity }: { activity: DashboardActivity }) {
  const style = activityStyles[activity.type];
  const Icon = style.icon;
  return <Link href={activity.href} className="flex gap-3 rounded-xl border bg-card p-3 transition hover:border-primary/30 hover:bg-muted/40"><span className={`grid size-9 shrink-0 place-items-center rounded-lg ${style.className}`}><Icon className={`size-4 ${style.iconClassName}`} /></span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1"><p className="font-semibold">{activity.title}</p><span className="text-[11px] font-medium text-muted-foreground">{style.label}</span></div><p className="mt-1 text-sm text-muted-foreground">{activity.description}</p><p className="mt-1.5 text-[11px] text-muted-foreground">{new Date(activity.timestamp).toLocaleString("id-ID")}</p></div></Link>;
}

export function InformationBoard({ overview }: { overview: DashboardInventoryOverview }) {
  return <Card className="flex h-[560px] flex-col border shadow-[0_8px_24px_rgba(28,36,52,0.04)]"><CardHeader className="p-5 pb-3 sm:p-6 sm:pb-3"><CardTitle className="text-lg">Papan informasi</CardTitle><p className="mt-1 text-sm text-muted-foreground">Aktivitas terbaru, diurutkan dari waktu paling baru.</p></CardHeader><CardContent className="min-h-0 flex-1 space-y-2 overflow-y-auto p-5 pt-2 sm:p-6 sm:pt-2">{overview.activityFeed.length === 0 ? <p className="rounded-xl bg-muted p-4 text-sm text-muted-foreground">Belum ada aktivitas inventaris yang tercatat.</p> : overview.activityFeed.map((activity) => <ActivityItem key={activity.id} activity={activity} />)}</CardContent></Card>;
}