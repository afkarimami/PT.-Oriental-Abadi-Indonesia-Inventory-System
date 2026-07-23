"use client";

import { useState, type ReactNode } from "react";
import { Pencil, Plus } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { ConfirmActionDialog } from "@/components/shared/confirm-action-dialog";
import { DataTableToolbar } from "@/components/shared/data-table-toolbar";
import { EmptyState } from "@/components/shared/empty-state";
import { FormDialog } from "@/components/shared/form-dialog";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { ActionResult, Pagination } from "./master-data-types";

type TableRecord = {
  id: string;
  code: string;
  name: string;
  isActive: boolean;
};

type TableColumn<Record extends TableRecord> = {
  header: string;
  className?: string;
  render: (record: Record) => ReactNode;
};

type MasterDataTableProps<Record extends TableRecord> = {
  records: Record[];
  pagination: Pagination;
  entityLabel: string;
  searchPlaceholder: string;
  columns: TableColumn<Record>[];
  emptyDescription: string;
  onToggleStatus: (id: string, isActive: boolean) => Promise<ActionResult>;
  renderForm: (record: Record | null, onSuccess: () => void) => ReactNode;
  relationFilter?: {
    param: string;
    label: string;
    options: { value: string; label: string }[];
  };
};

export function MasterDataTable<Record extends TableRecord>({
  records,
  pagination,
  entityLabel,
  searchPlaceholder,
  columns,
  emptyDescription,
  onToggleStatus,
  renderForm,
  relationFilter,
}: MasterDataTableProps<Record>) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Record | null>(null);
  const [statusRecord, setStatusRecord] = useState<Record | null>(null);
  const totalPages = Math.max(1, Math.ceil(pagination.total / pagination.pageSize));
  const firstRecord = pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.pageSize + 1;
  const lastRecord = Math.min(pagination.page * pagination.pageSize, pagination.total);

  const changePage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    router.push(`${pathname}?${params.toString()}`);
  };

  const openNewForm = () => {
    setEditingRecord(null);
    setIsFormOpen(true);
  };

  const openEditForm = (record: Record) => {
    setEditingRecord(record);
    setIsFormOpen(true);
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setEditingRecord(null);
    router.refresh();
  };

  const handleStatusChange = async () => {
    if (!statusRecord) return;
    const result = await onToggleStatus(statusRecord.id, !statusRecord.isActive);
    toast[result.success ? "success" : "error"](result.message);
    if (result.success) router.refresh();
    setStatusRecord(null);
  };

  return (
    <section className="space-y-4">
      <DataTableToolbar
        searchPlaceholder={searchPlaceholder}
        relationParam={relationFilter?.param}
        relationLabel={relationFilter?.label}
        relationOptions={relationFilter?.options}
      >
        <Button type="button" className="h-10 rounded-xl" onClick={openNewForm}>
          <Plus data-icon="inline-start" /> Tambah {entityLabel}
        </Button>
      </DataTableToolbar>

      <div className="overflow-hidden rounded-2xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.header} className={column.className}>{column.header}</TableHead>
              ))}
              <TableHead className="w-48 text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + 1} className="p-0">
                  <EmptyState title={`Belum ada ${entityLabel.toLowerCase()}`} description={emptyDescription} />
                </TableCell>
              </TableRow>
            ) : records.map((record) => (
              <TableRow key={record.id}>
                {columns.map((column) => <TableCell key={column.header} className={column.className}>{column.render(record)}</TableCell>)}
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => openEditForm(record)}>
                      <Pencil data-icon="inline-start" /> Edit
                    </Button>
                    <Button type="button" variant={record.isActive ? "destructive" : "secondary"} size="sm" onClick={() => setStatusRecord(record)}>
                      {record.isActive ? "Nonaktifkan" : "Aktifkan"}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>Menampilkan {firstRecord}-{lastRecord} dari {pagination.total} data</p>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" size="sm" disabled={pagination.page <= 1} onClick={() => changePage(pagination.page - 1)}>Sebelumnya</Button>
          <span>Halaman {pagination.page} dari {totalPages}</span>
          <Button type="button" variant="outline" size="sm" disabled={pagination.page >= totalPages || pagination.total === 0} onClick={() => changePage(pagination.page + 1)}>Berikutnya</Button>
        </div>
      </div>

      <FormDialog
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) setEditingRecord(null);
        }}
        title={editingRecord ? `Edit ${entityLabel}` : `Tambah ${entityLabel}`}
        description={editingRecord ? `Perbarui informasi ${entityLabel.toLowerCase()} ini.` : `Masukkan informasi ${entityLabel.toLowerCase()} baru.`}
      >
        <div key={editingRecord?.id ?? "new"}>{renderForm(editingRecord, handleFormSuccess)}</div>
      </FormDialog>

      <ConfirmActionDialog
        open={Boolean(statusRecord)}
        onOpenChange={(open) => { if (!open) setStatusRecord(null); }}
        title={statusRecord?.isActive ? `Nonaktifkan ${entityLabel}?` : `Aktifkan ${entityLabel}?`}
        description={statusRecord?.isActive ? `Data ${statusRecord.name} tidak dapat dipilih untuk data baru setelah dinonaktifkan.` : `Data ${statusRecord?.name} akan kembali tersedia untuk dipilih.`}
        confirmLabel={statusRecord?.isActive ? "Ya, nonaktifkan" : "Ya, aktifkan"}
        onConfirm={handleStatusChange}
      />
    </section>
  );
}
