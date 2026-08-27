"use client";

import Link from "next/link";
import { ArrowLeft, Package } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { PageTitle } from "@/components/shared/page-title";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { InventoryRackDetail, InventoryItem, InventoryPagination } from "./inventory-types";

type RackInventoryPageProps = {
  rack: InventoryRackDetail | any;
  records?: InventoryItem[];
  items?: any[];
  pagination?: InventoryPagination;
};

export function RackInventoryPage({
  rack,
  records,
  items,
}: RackInventoryPageProps) {
  // Ambil data dari records (dari getInventoryItems) atau items sebagai fallback
  const displayItems = records ?? items ?? [];

  return (
    <PageContainer>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/inventory"
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "mb-2 gap-2 rounded-lg")}
          >
            <ArrowLeft className="size-4" /> Kembali ke daftar rak
          </Link>
          <PageTitle
            eyebrow={`Kode Rak: ${rack?.code ?? ""}`}
            title={`Rak ${rack?.code ?? ""}`}
            description={rack?.name || `Daftar barang yang tersimpan di Rak ${rack?.code ?? ""}`}
          />
        </div>
      </div>

      <div className="grid gap-4">
        {displayItems.length === 0 ? (
          <div className="rounded-2xl border border-dashed p-8 text-center text-muted-foreground">
            <Package className="mx-auto size-8 opacity-50" />
            <p className="mt-2 text-sm">Belum ada barang di rak ini.</p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {displayItems.map((item) => (
              <div key={item.id} className="rounded-xl border bg-card p-4 shadow-sm">
                <div className="font-semibold">{item.name}</div>
                <div className="mt-1 font-mono text-xs text-muted-foreground">{item.code}</div>
                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="rounded-md bg-muted px-2 py-1 font-medium">{item.itemType}</span>
                  <span className="font-semibold text-primary">
                    Stok: {item.currentQuantity ?? item.initialQuantity ?? 0}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageContainer>
  );
}