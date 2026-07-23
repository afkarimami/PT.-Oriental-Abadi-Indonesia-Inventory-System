"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import type { InventorySearchItem } from "./inventory-types";

export function InventorySearch({ items }: { items: InventorySearchItem[] }) {
  const [query, setQuery] = useState("");
  const results = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return [];
    return items.filter((item) => (item.name + " " + item.code + " " + item.rackCode).toLowerCase().includes(normalizedQuery)).slice(0, 8);
  }, [items, query]);

  return <div className="relative w-full sm:max-w-md"><label className="relative block"><span className="sr-only">Cari semua barang inventaris</span><Search className="pointer-events-none absolute top-1/2 left-3 z-10 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={query} onChange={(event) => setQuery(event.target.value)} className="h-11 rounded-xl bg-card pl-9 shadow-sm" placeholder="Cari nama atau kode barang" autoComplete="off" /></label>{query && <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-xl border bg-popover shadow-lg">{results.length === 0 ? <p className="px-4 py-3 text-sm text-muted-foreground">Barang tidak ditemukan.</p> : results.map((item) => <Link key={item.id} href={"/inventory/racks/" + item.rackId + "?search=" + encodeURIComponent(item.name)} onClick={() => setQuery("")} className="flex items-center justify-between gap-3 px-4 py-3 transition hover:bg-muted"><span className="min-w-0"><span className="block truncate text-sm font-semibold">{item.name}</span><span className="block font-mono text-xs text-muted-foreground">{item.code} - Rak {item.rackCode}</span></span><span className="shrink-0 text-right text-xs text-muted-foreground"><span className="block font-semibold text-foreground">{item.currentQuantity ?? "-"} unit</span>tersedia</span></Link>)}</div>}</div>;
}
