import { InventoryPage } from "@/features/inventory/inventory-page";
import { getInventoryRackSummaries, getInventorySearchItems, getInventoryStockExportItems } from "@/features/inventory/inventory-queries";

export default async function Page() {
  const [racks, searchItems, exportItems] = await Promise.all([getInventoryRackSummaries(), getInventorySearchItems(), getInventoryStockExportItems()]);
  return <InventoryPage racks={racks} searchItems={searchItems} exportItems={exportItems} />;
}