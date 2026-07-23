import { AvailableInventoryPage } from "@/features/inventory/available-inventory-page";
import { getAvailableInventoryItems } from "@/features/inventory/inventory-queries";

export default async function Page() {
  return <AvailableInventoryPage items={await getAvailableInventoryItems()} />;
}