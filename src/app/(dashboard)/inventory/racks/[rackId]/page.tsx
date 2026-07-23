import { notFound } from "next/navigation";
import { RackInventoryPage } from "@/features/inventory/rack-inventory-page";
import { getInventoryItems, getInventoryRackById } from "@/features/inventory/inventory-queries";
import type { InventoryParams } from "@/features/inventory/inventory-types";

type PageProps = {
  params: Promise<{ rackId: string }>;
  searchParams: Promise<Omit<InventoryParams, "rack">>;
};

export default async function Page({ params, searchParams }: PageProps) {
  const [{ rackId }, inventoryParams] = await Promise.all([params, searchParams]);
  const [rack, result] = await Promise.all([
    getInventoryRackById(rackId),
    getInventoryItems({ ...inventoryParams, rack: rackId }),
  ]);
  if (!rack) notFound();

  return <RackInventoryPage rack={rack} {...result} />;
}