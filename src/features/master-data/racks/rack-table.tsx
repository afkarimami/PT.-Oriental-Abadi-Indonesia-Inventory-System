"use client";

import { ActiveStatusBadge } from "@/components/shared/active-status-badge";
import { MasterDataTable } from "../master-data-table";
import type { Pagination, RackRecord } from "../master-data-types";
import { toggleRackStatus } from "./rack-actions";
import { RackForm } from "./rack-form";

type RackTableProps = { records: RackRecord[]; pagination: Pagination };

export function RackTable({ records, pagination }: RackTableProps) {
  return (
    <MasterDataTable
      records={records}
      pagination={pagination}
      entityLabel="Rak"
      searchPlaceholder="Cari kode, nama, atau deskripsi rak"
      emptyDescription="Tambahkan rak untuk menyusun barang inventaris."
      onToggleStatus={toggleRackStatus}
      renderForm={(record, onSuccess) => <RackForm record={record} onSuccess={onSuccess} />}
      columns={[
        { header: "Kode", render: (record) => <span className="font-mono text-xs font-medium">{record.code}</span> },
        { header: "Rak", render: (record) => <span className="font-medium">{record.name}</span> },
        { header: "Status", render: (record) => <ActiveStatusBadge isActive={record.isActive} /> },
      ]}
    />
  );
}