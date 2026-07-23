import { PageContainer } from "@/components/layout/page-container";
import { PageTitle } from "@/components/shared/page-title";
import { InventorySearch } from "./inventory-search";
import { InventoryTable } from "./inventory-table";
import { StockExportButton } from "./stock-export-button";
import { StockReceiptDialog } from "./stock-receipt-dialog";
import type { InventoryRackSummary, InventorySearchItem, InventoryStockExportItem } from "./inventory-types";

type InventoryPageProps = {
  racks: InventoryRackSummary[];
  searchItems: InventorySearchItem[];
  exportItems: InventoryStockExportItem[];
};

export function InventoryPage({ racks, searchItems, exportItems }: InventoryPageProps) {
  return <PageContainer><div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between"><PageTitle eyebrow="Susunan inventaris" title="Cari barang berdasarkan rak" description="Cari semua barang langsung, atau pilih rak untuk melihat susunannya." /><div className="flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap xl:max-w-3xl"><InventorySearch items={searchItems} /><StockExportButton items={exportItems} /><StockReceiptDialog items={searchItems} racks={racks} /></div></div><InventoryTable racks={racks} /></PageContainer>;
}