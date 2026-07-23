import Link from "next/link";
import { Boxes } from "lucide-react";
import type { InventoryRackSummary } from "./inventory-types";

type InventoryTableProps = {
  racks: InventoryRackSummary[];
};

export function InventoryTable({ racks }: InventoryTableProps) {
  return (
    <section>
      <div className="mb-3 flex items-center gap-2">
        <Boxes className="size-5 text-primary" />
        <h2 className="text-lg font-bold">Pilih rak</h2>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {racks.map((rack) => (
          <Link key={rack.id} href={`/inventory/racks/${rack.id}`} className="group min-h-40 rounded-2xl border bg-card p-5 text-left shadow-[0_8px_24px_rgba(28,36,52,0.04)] transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_12px_32px_rgba(79,105,255,0.12)]">
            <div className="flex items-start justify-between">
              <span className="grid size-11 place-items-center rounded-2xl bg-primary/10 text-primary"><Boxes className="size-5" /></span>
              <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">{rack.itemCount} item</span>
            </div>
            <p className="mt-5 text-2xl font-bold">Rak {rack.code}</p>
            <p className="mt-1 text-sm text-muted-foreground">{rack.name}</p>
            <p className="mt-4 text-xs text-muted-foreground">{rack.totalQuantity.toLocaleString("id-ID")} unit tercatat</p>
            <p className="mt-4 text-sm font-semibold text-primary transition group-hover:translate-x-1">Buka isi rak -&gt;</p>
          </Link>
        ))}
      </div>
    </section>
  );
}