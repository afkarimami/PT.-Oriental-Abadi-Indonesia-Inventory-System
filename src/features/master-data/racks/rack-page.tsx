import { PageContainer } from "@/components/layout/page-container";
import { PageTitle } from "@/components/shared/page-title";
import type { Pagination, RackRecord } from "../master-data-types";
import { RackTable } from "./rack-table";

type RackPageProps = { records: RackRecord[]; pagination: Pagination };

export function RackPage({ records, pagination }: RackPageProps) {
  return (
    <PageContainer>
      <PageTitle eyebrow="Susunan penyimpanan" title="Rak" description="Tambah atau ubah rak untuk menyusun inventaris kantor." className="mb-6" />
      <RackTable records={records} pagination={pagination} />
    </PageContainer>
  );
}