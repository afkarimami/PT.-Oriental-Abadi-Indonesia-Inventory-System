import { PageContainer } from "@/components/layout/page-container";
import { PageTitle } from "@/components/shared/page-title";
import { RackInventoryDetail } from "./rack-inventory-detail";
import type { InventoryItem, InventoryPagination, InventoryRackDetail } from "./inventory-types";

type RackInventoryPageProps = {
  rack: InventoryRackDetail;
  records: InventoryItem[];
  pagination: InventoryPagination;
};

export function RackInventoryPage({ rack, records, pagination }: RackInventoryPageProps) {
  return (
    <PageContainer>
      <PageTitle eyebrow="Detail rak" title={`Inventaris Rak ${rack.code}`} description="Lihat, cari, dan periksa kuantitas barang di rak ini." className="mb-6" />
      <RackInventoryDetail rack={rack} records={records} pagination={pagination} />
    </PageContainer>
  );
}