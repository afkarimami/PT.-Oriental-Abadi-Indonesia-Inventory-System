"use client";

import Link from "next/link";
import { ArrowLeft, Package, Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { InventoryItem, InventoryPagination, InventoryRackDetail } from "./inventory-types";

type RackInventoryDetailProps = {
  rack: InventoryRackDetail;
  records: InventoryItem[];
  pagination: InventoryPagination;
};

const itemTypeLabel = {
  consumable: "Consumable",
  inventory: "Alat inventaris",
  unclassified: "Perlu klasifikasi",
};

function quantity(value: number | null) {
  return value === null ? "0" : value.toLocaleString("id-ID");
}

export function RackInventoryDetail({ rack, records, pagination }: RackInventoryDetailProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const totalPages = Math.max(1, Math.ceil(pagination.total / pagination.pageSize));
  const firstRecord = pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.pageSize + 1;
  const lastRecord = Math.min(pagination.page * pagination.pageSize, pagination.total);

  const updateParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => (value ? params.set(key, value) : params.delete(key)));
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  const changePage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <section className="space-y-6">
      <Link href="/inventory" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition hover:text-primary">
        <ArrowLeft className="size-4" />
        Kembali ke daftar rak
      </Link>

      <div className="rounded-2xl border bg-card p-5 shadow-[0_8px_24px_rgba(28,36,52,0.04)]">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-primary">Rak {rack.code}</p>
            <h2 className="mt-1 text-2xl font-bold">{rack.name} - {rack.locationName}</h2>
            <p className="mt-1 text-sm text-muted-foreground">Daftar barang yang tersusun di rak ini.</p>
          </div>
          <div className="rounded-xl bg-muted/60 px-5 py-3 text-center">
            <p className="text-xs text-muted-foreground">Total barang</p>
            <p className="mt-1 text-xl font-bold">{pagination.total}</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border bg-card p-4 shadow-[0_8px_24px_rgba(28,36,52,0.04)] sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-xl font-bold">Isi Rak {rack.code}</h3>
            <p className="mt-1 text-sm text-muted-foreground">Cari nama atau kode barang di Rak {rack.code}.</p>
          </div>
          <form className="relative w-full lg:max-w-sm" onSubmit={(event) => { event.preventDefault(); updateParams({ search: new FormData(event.currentTarget).get("search")?.toString() ?? "" }); }}>
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input name="search" defaultValue={searchParams.get("search") ?? ""} className="h-11 rounded-xl pl-9" placeholder="Cari alat atau kode barang" />
          </form>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t pt-4">
          <span className="text-sm text-muted-foreground">Jenis:</span>
          <select value={searchParams.get("type") ?? ""} onChange={(event) => updateParams({ type: event.target.value || null })} className="h-9 rounded-lg border bg-background px-3 text-sm">
            <option value="">Semua barang</option>
            <option value="consumable">Consumable</option>
            <option value="inventory">Alat inventaris</option>
            <option value="unclassified">Perlu klasifikasi</option>
          </select>
          {searchParams.get("search") && <Button type="button" variant="ghost" size="sm" onClick={() => updateParams({ search: null })}>Hapus pencarian</Button>}
        </div>
      </div>

      {records.length === 0 ? (
        <EmptyState title={`Rak ${rack.code} belum memiliki item`} description="Coba ubah kata pencarian atau jalankan seed inventaris untuk mengisi barang." />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {records.map((record) => {
              const currentStock = record.currentQuantity ?? 0;

              return (
                <article key={record.id} className="rounded-2xl border bg-card p-5 shadow-[0_8px_24px_rgba(28,36,52,0.04)]">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-mono text-xs font-semibold text-primary">{record.code}</p>
                      <h3 className="mt-2 text-base font-bold">{record.name}</h3>
                      <p className="mt-1 text-xs text-muted-foreground">{itemTypeLabel[record.itemType]}</p>
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${currentStock > 0 ? "bg-emerald-50 text-emerald-800" : "bg-destructive/10 text-destructive"}`}>
                      {currentStock > 0 ? "Tersedia" : "Stok Habis"}
                    </span>
                  </div>

                  {/* TAMPILAN BARU: HANYA MENAMPILKAN SATU INDIKATOR STOK YANG ADIR DAN JELAS */}
                  <div className="mt-5 rounded-xl bg-muted/60 p-4">
                    <p className="text-xs text-muted-foreground">Stok Barang</p>
                    <p className="mt-1 text-2xl font-bold text-foreground">{quantity(currentStock)} <span className="text-xs font-normal text-muted-foreground">unit</span></p>
                  </div>

                  <div className="mt-4 flex items-center gap-2 border-t pt-3 text-xs text-muted-foreground">
                    <Package className="size-3.5" />
                    Rak {record.rack.code}
                  </div>
                </article>
              );
            })}
          </div>

          <div className="flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <p>Menampilkan {firstRecord}-{lastRecord} dari {pagination.total} barang di Rak {rack.code}</p>
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" size="sm" disabled={pagination.page <= 1} onClick={() => changePage(pagination.page - 1)}>Sebelumnya</Button>
              <span>Halaman {pagination.page} dari {totalPages}</span>
              <Button type="button" variant="outline" size="sm" disabled={pagination.page >= totalPages || pagination.total === 0} onClick={() => changePage(pagination.page + 1)}>Berikutnya</Button>
            </div>
          </div>
        </>
      )}
    </section>
  );
}