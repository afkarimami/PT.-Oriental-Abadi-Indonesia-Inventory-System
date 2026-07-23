import Link from "next/link";
import { ArrowLeft, PackageCheck } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { PageTitle } from "@/components/shared/page-title";
import type { InventoryItem } from "./inventory-types";

const itemTypeLabels = {
  inventory: "Alat inventaris",
  consumable: "Consumable",
  unclassified: "Belum diklasifikasi",
};

export function AvailableInventoryPage({ items }: { items: InventoryItem[] }) {
  return (
    <PageContainer>
      <Link href="/inventory" className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-primary"><ArrowLeft className="size-4" /> Kembali ke inventory per rak</Link>
      <PageTitle eyebrow="Stok tersedia" title="Semua barang available" description="Daftar semua barang dengan kuantitas tersedia, tanpa dikelompokkan per rak." className="mb-6" />
      <section className="overflow-hidden rounded-2xl border bg-card shadow-[0_8px_24px_rgba(28,36,52,0.04)]">
        <div className="flex items-center justify-between border-b px-5 py-4"><div className="flex items-center gap-2"><PackageCheck className="size-5 text-emerald-600" /><h2 className="font-bold">Barang tersedia</h2></div><span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">{items.length} jenis barang</span></div>
        {items.length === 0 ? <p className="p-8 text-center text-sm text-muted-foreground">Belum ada barang dengan stok tersedia.</p> : <div className="divide-y">{items.map((item) => <article key={item.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><p className="font-mono text-xs font-semibold text-primary">{item.code}</p><h3 className="mt-1 font-semibold">{item.name}</h3><p className="mt-1 text-sm text-muted-foreground">Rak {item.rack.code} - {item.rack.name} - {itemTypeLabels[item.itemType]}</p></div><div className="rounded-xl bg-emerald-50 px-4 py-2 text-right"><p className="text-xs text-emerald-700">Tersedia</p><p className="text-xl font-bold text-emerald-800">{item.currentQuantity} unit</p></div></article>)}</div>}
      </section>
    </PageContainer>
  );
}