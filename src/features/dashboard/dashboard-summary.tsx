import Link from "next/link";
import { Archive, CircleAlert, Handshake, PackageCheck, type LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { DashboardInventoryOverview } from "./dashboard-queries";

type SummaryCard = {
  label: string;
  value: string;
  detail: string;
  href: string;
  icon: LucideIcon;
  color: string;
  iconColor: string;
};

export function DashboardSummary({ overview }: { overview: DashboardInventoryOverview }) {
  const borrowedDetail = overview.borrowedItems > 0
    ? overview.activeLoanCount + " transaksi pinjam aktif"
    : "Belum ada transaksi pinjam";
  const attentionDetail = overview.overdueLoanCount > 0
    ? `${overview.overdueLoanCount} terlambat${overview.dueSoonLoanCount > 0 ? `, ${overview.dueSoonLoanCount} tenggat dekat` : ""}`
    : overview.dueSoonLoanCount > 0
      ? `${overview.dueSoonLoanCount} tenggat dekat`
      : "Tidak ada pinjaman yang perlu ditindaklanjuti";
  const summaries: SummaryCard[] = [
    { label: "Total Inventory", value: overview.totalItems.toLocaleString("id-ID"), detail: "Lihat semua barang per rak", href: "/inventory", icon: Archive, color: "bg-[#edf0ff]", iconColor: "text-[#526dff]" },
    { label: "Available", value: overview.availableUnits.toLocaleString("id-ID"), detail: "Buka daftar semua barang tersedia", href: "/inventory/available", icon: PackageCheck, color: "bg-[#e8faf4]", iconColor: "text-[#249f76]" },
    { label: "Borrowed", value: overview.borrowedItems.toLocaleString("id-ID"), detail: borrowedDetail, href: "/loans", icon: Handshake, color: "bg-[#fff6df]", iconColor: "text-[#d59817]" },
    { label: "Needs Attention", value: overview.needsAttention.toLocaleString("id-ID"), detail: attentionDetail, href: "/loans?view=attention", icon: CircleAlert, color: "bg-[#fff0ef]", iconColor: "text-[#df615d]" },
  ];

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Ringkasan inventaris">
      {summaries.map((summary) => {
        const Icon = summary.icon;
        return (
          <Link key={summary.label} href={summary.href} aria-label={`Buka ${summary.label}`} className="rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
            <Card className="h-full border shadow-[0_8px_24px_rgba(28,36,52,0.04)] transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_12px_32px_rgba(79,105,255,0.12)]">
              <CardContent className="flex items-start justify-between p-5">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{summary.label}</p>
                  <p className="mt-2 text-3xl font-bold">{summary.value}</p>
                  <p className="mt-2 text-xs text-muted-foreground">{summary.detail}</p>
                </div>
                <span className={`grid size-11 place-items-center rounded-2xl ${summary.color} ${summary.iconColor}`}><Icon className="size-5" /></span>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </section>
  );
}