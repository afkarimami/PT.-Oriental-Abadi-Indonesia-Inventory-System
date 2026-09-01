"use client";

import Link from "next/link";
import { useState, type FormEvent, type ReactNode } from "react";
import { ChevronRight, Plus, Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { FormDialog } from "@/components/shared/form-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { createLoan } from "./loan-actions";
import { uploadLoanDocumentation } from "./loan-document-upload";
import { ImageUploadField } from "./image-upload-field";
import type { LoanListRecord, LoanableItem } from "./loan-types";

type LoanListProps = {
  loans: LoanListRecord[];
  items: LoanableItem[];
  attentionMode?: boolean;
};

type LoanItemInput = {
  inventoryItemId: string;
  quantity: number;
};

const statusLabel = {
  active: "Sedang dipinjam",
  closed: "Selesai",
  overdue: "Terlambat",
};

export function LoanList({
  loans,
  items,
  attentionMode = false,
}: LoanListProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isOpen, setIsOpen] = useState(false);

  const activeCount = loans.length;

  const overdueCount = loans.filter(
    (loan: any) => loan.status === "overdue",
  ).length;

  const borrowedQuantity = loans.reduce(
    (total: number, loan: any) =>
      total + Number(loan.outstandingQuantity ?? 0),
    0,
  );

  const updateParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    const queryString = params.toString();

    router.push(queryString ? pathname + "?" + queryString : pathname);
  };

  return (
    <section className="space-y-5">
      {/* SUMMARY */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Summary
          label={
            attentionMode ? "Perlu ditindaklanjuti" : "Transaksi aktif"
          }
          value={activeCount}
        />

        <Summary
          label="Terlambat"
          value={overdueCount}
          alert
        />

        <Summary
          label="Barang masih dipinjam"
          value={borrowedQuantity}
        />
      </div>

      {/* SEARCH + BUTTON */}
      <div className="flex flex-col gap-3 rounded-2xl border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
        <form
          className="relative w-full sm:max-w-md"
          onSubmit={(event) => {
            event.preventDefault();

            updateParams({
              search:
                new FormData(event.currentTarget)
                  .get("search")
                  ?.toString() ?? "",
            });
          }}
        >
          <Search className="pointer-events-none absolute top-1/2 left-3 z-10 size-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            name="search"
            defaultValue={searchParams.get("search") ?? ""}
            className="h-10 rounded-xl pl-9"
            placeholder="Cari peminjam, keperluan, atau kode transaksi"
          />
        </form>

        <Button
          type="button"
          className="w-full rounded-xl sm:w-auto"
          onClick={() => setIsOpen(true)}
        >
          <Plus />
          Buat peminjaman
        </Button>
      </div>

      {/* LOAN LIST */}
      <div className="overflow-hidden rounded-2xl border bg-card">
        <div className="divide-y">
          {loans.length === 0 ? (
            <p className="p-8 text-center text-sm text-muted-foreground">
              Belum ada transaksi aktif. Buat peminjaman baru saat alat
              diserahkan.
            </p>
          ) : (
            loans.map((loan: any) => (
              <Link
                key={loan.id}
                href={"/loans/" + loan.id}
                className="flex items-center gap-4 p-4 transition hover:bg-muted/50"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-mono text-xs font-semibold text-primary">
                      {loan.code}
                    </p>

                    <StatusBadge status={loan.status} />

                    {loan.attentionStatus === "due_soon" && (
                      <Badge variant="secondary">
                        Tenggat dekat
                      </Badge>
                    )}
                  </div>

                  <p className="mt-1 font-semibold">
                    {loan.borrowerName}
                  </p>

                  <p className="text-sm text-muted-foreground">
                    {loan.purpose} - {loan.itemCount} jenis alat,{" "}
                    {loan.outstandingQuantity} masih dipinjam
                  </p>
                </div>

                <div className="hidden text-right text-sm sm:block">
                  <p>
                    {loan.expectedReturnOn
                      ? "Kembali " +
                        new Date(
                          loan.expectedReturnOn,
                        ).toLocaleDateString("id-ID")
                      : "Tanpa jadwal kembali"}
                  </p>

                  <p className="text-muted-foreground">
                    {loan.borrowerPhone}
                  </p>
                </div>

                <ChevronRight className="size-5 shrink-0 text-muted-foreground" />
              </Link>
            ))
          )}
        </div>
      </div>

      {/* FORM DIALOG */}
      <FormDialog
        open={isOpen}
        onOpenChange={setIsOpen}
        title="Buat peminjaman"
        description="Stok barang otomatis berkurang setelah transaksi disimpan."
      >
        <LoanForm
          items={items}
          onSuccess={(loanId) => {
            setIsOpen(false);
            router.push("/loans/" + loanId);
          }}
        />
      </FormDialog>
    </section>
  );
}

function Summary({
  label,
  value,
  alert = false,
}: {
  label: string;
  value: number;
  alert?: boolean;
}) {
  return (
    <div
      className={
        "rounded-2xl border p-4 " +
        (alert && value > 0
          ? "border-amber-200 bg-amber-50"
          : "bg-card")
      }
    >
      <p className="text-sm text-muted-foreground">
        {label}
      </p>

      <p className="mt-2 text-2xl font-bold">
        {value}
      </p>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: keyof typeof statusLabel;
}) {
  return (
    <Badge
      variant={
        status === "overdue"
          ? "destructive"
          : status === "closed"
            ? "secondary"
            : "default"
      }
    >
      {statusLabel[status]}
    </Badge>
  );
}

function LoanForm({
  items,
  onSuccess,
}: {
  items: LoanableItem[];
  onSuccess: (loanId: string) => void;
}) {
  const [borrowerName, setBorrowerName] = useState("");
  const [borrowerPhone, setBorrowerPhone] = useState("");
  const [borrowerOrganization, setBorrowerOrganization] =
    useState("");
  const [purpose, setPurpose] = useState("");
  const [expectedReturnOn, setExpectedReturnOn] =
    useState("");
  const [notes, setNotes] = useState("");
  const [itemSearch, setItemSearch] = useState("");
  const [loanItems, setLoanItems] = useState<LoanItemInput[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [isPending, setIsPending] = useState(false);

  const selectedItemIds = new Set(
    loanItems.map((item) => item.inventoryItemId),
  );

  /*
   * PENCARIAN BARANG
   *
   * Database inventory_items:
   * - name
   * - code
   * - current_quantity
   *
   * Jadi kita tidak lagi menggunakan:
   * - availableQuantity
   * - rackCode
   */
  const searchResults = itemSearch.trim()
    ? items
        .filter((item: any) => {
          const name = String(item.name ?? "");
          const code = String(item.code ?? "");
          const currentQuantity = Number(
            item.current_quantity ?? 0,
          );

          const searchText =
            `${name} ${code}`.toLowerCase();

          const keyword =
            itemSearch.trim().toLowerCase();

          return (
            !selectedItemIds.has(item.id) &&
            currentQuantity > 0 &&
            searchText.includes(keyword)
          );
        })
        .slice(0, 8)
    : [];

  const addItem = (item: LoanableItem) => {
    const currentQuantity = Number(
      (item as any).current_quantity ?? 0,
    );

    if (currentQuantity <= 0) {
      toast.error("Stok barang tersebut sudah habis.");
      return;
    }

    setLoanItems((current) => [
      ...current,
      {
        inventoryItemId: item.id,
        quantity: 1,
      },
    ]);

    setItemSearch("");
  };

  const submit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (loanItems.length === 0) {
      toast.error(
        "Cari lalu pilih minimal satu barang.",
      );
      return;
    }

    // Pastikan jumlah tidak melebihi stok
    const invalidItem = loanItems.find((row) => {
      const item = items.find(
        (candidate: any) =>
          candidate.id === row.inventoryItemId,
      );

      if (!item) return true;

      const currentQuantity = Number(
        (item as any).current_quantity ?? 0,
      );

      return (
        row.quantity < 1 ||
        row.quantity > currentQuantity
      );
    });

    if (invalidItem) {
      toast.error(
        "Jumlah barang melebihi stok yang tersedia.",
      );
      return;
    }

    setIsPending(true);

    try {
      const documentationPath = file
        ? await uploadLoanDocumentation(file)
        : undefined;

      const formData = new FormData();

      formData.append(
        "borrowerName",
        borrowerName,
      );

      formData.append(
        "borrowerPhone",
        borrowerPhone,
      );

      if (borrowerOrganization) {
        formData.append(
          "borrowerOrganization",
          borrowerOrganization,
        );
      }

      formData.append("purpose", purpose);

      if (expectedReturnOn) {
        formData.append(
          "expectedReturnOn",
          expectedReturnOn,
        );
      }

      if (notes) {
        formData.append("notes", notes);
      }

      if (documentationPath) {
        formData.append(
          "documentationPath",
          documentationPath,
        );
      }

      formData.append(
        "items",
        JSON.stringify(loanItems),
      );

      const result: any = await createLoan(
        formData as any,
      );

      if (!result.success || !result.loanId) {
        toast.error(
          result.message ||
            "Gagal membuat peminjaman",
        );
        return;
      }

      toast.success(
        result.message ||
          "Peminjaman berhasil dibuat",
      );

      onSuccess(result.loanId);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Peminjaman gagal dicatat.",
      );
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form
      className="grid max-h-[75vh] gap-4 overflow-y-auto pr-1"
      onSubmit={submit}
    >
      {/* NAMA PEMINJAM */}
      <Field label="Nama peminjam">
        <Input
          value={borrowerName}
          onChange={(event) =>
            setBorrowerName(event.target.value)
          }
          required
        />
      </Field>

      {/* NOMOR HP */}
      <Field label="Nomor HP">
        <Input
          type="tel"
          value={borrowerPhone}
          onChange={(event) =>
            setBorrowerPhone(event.target.value)
          }
          required
        />
      </Field>

      {/* INSTANSI */}
      <Field label="Instansi (opsional)">
        <Input
          value={borrowerOrganization}
          onChange={(event) =>
            setBorrowerOrganization(
              event.target.value,
            )
          }
          placeholder="Untuk peminjam dari luar"
        />
      </Field>

      {/* KEPERLUAN */}
      <Field label="Keperluan">
        <Input
          value={purpose}
          onChange={(event) =>
            setPurpose(event.target.value)
          }
          required
        />
      </Field>

      {/* TANGGAL KEMBALI */}
      <Field label="Rencana kembali (opsional)">
        <Input
          type="date"
          value={expectedReturnOn}
          onChange={(event) =>
            setExpectedReturnOn(
              event.target.value,
            )
          }
        />
      </Field>

      {/* CARI BARANG */}
      <Field label="Cari barang">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 z-10 size-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            value={itemSearch}
            onChange={(event) =>
              setItemSearch(event.target.value)
            }
            className="h-10 pl-9"
            placeholder="Ketik nama atau kode barang"
            autoComplete="off"
          />

          {itemSearch && (
            <div className="absolute z-50 mt-1 max-h-64 w-full overflow-y-auto rounded-xl border bg-popover shadow-lg">
              {searchResults.length === 0 ? (
                <p className="px-3 py-3 text-sm text-muted-foreground">
                  Barang tidak ditemukan atau stok
                  sudah habis.
                </p>
              ) : (
                searchResults.map((item: any) => {
                  const currentQuantity = Number(
                    item.current_quantity ?? 0,
                  );

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() =>
                        addItem(item)
                      }
                      className="flex w-full items-center justify-between gap-3 px-3 py-3 text-left text-sm hover:bg-muted"
                    >
                      <span className="min-w-0">
                        <span className="block truncate font-medium">
                          {item.name}
                        </span>

                        <span className="block font-mono text-xs text-muted-foreground">
                          {item.code}
                        </span>
                      </span>

                      <span className="shrink-0 text-xs font-medium text-primary">
                        Tersedia {currentQuantity}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          )}
        </div>
      </Field>

      {/* BARANG YANG DIPILIH */}
      <div className="grid gap-2">
        {loanItems.length === 0 ? (
          <p className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
            Belum ada barang dipilih. Gunakan
            pencarian di atas.
          </p>
        ) : (
          loanItems.map((row) => {
            const item = items.find(
              (candidate: any) =>
                candidate.id ===
                row.inventoryItemId,
            );

            if (!item) return null;

            const currentQuantity = Number(
              (item as any).current_quantity ?? 0,
            );

            return (
              <div
                key={row.inventoryItemId}
                className="flex flex-col gap-3 rounded-xl border p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">
                    {(item as any).name}
                  </p>

                  <p className="font-mono text-xs text-muted-foreground">
                    {(item as any).code} -
                    tersedia {currentQuantity}
                  </p>
                </div>

                <div className="flex items-center justify-between gap-3 sm:justify-end">
                  {/* JUMLAH */}
                  <div className="flex items-center gap-1 rounded-xl border bg-background p-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-base font-bold"
                      onClick={() =>
                        setLoanItems(
                          (current) =>
                            current.map(
                              (selected) =>
                                selected.inventoryItemId ===
                                row.inventoryItemId
                                  ? {
                                      ...selected,
                                      quantity:
                                        Math.max(
                                          1,
                                          selected.quantity -
                                            1,
                                        ),
                                    }
                                  : selected,
                            ),
                        )
                      }
                    >
                      -
                    </Button>

                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={
                        row.quantity === 0
                          ? ""
                          : String(row.quantity)
                      }
                      onChange={(event) => {
                        const rawVal =
                          event.target.value.replace(
                            /[^0-9]/g,
                            "",
                          );

                        const cleanVal =
                          rawVal.replace(
                            /^0+/,
                            "",
                          );

                        const numVal =
                          cleanVal === ""
                            ? 0
                            : Math.min(
                                currentQuantity,
                                Number(cleanVal),
                              );

                        setLoanItems(
                          (current) =>
                            current.map(
                              (selected) =>
                                selected.inventoryItemId ===
                                row.inventoryItemId
                                  ? {
                                      ...selected,
                                      quantity:
                                        numVal,
                                    }
                                  : selected,
                            ),
                        );
                      }}
                      onBlur={() => {
                        if (
                          !row.quantity ||
                          row.quantity < 1
                        ) {
                          setLoanItems(
                            (current) =>
                              current.map(
                                (selected) =>
                                  selected.inventoryItemId ===
                                  row.inventoryItemId
                                    ? {
                                        ...selected,
                                        quantity: 1,
                                      }
                                    : selected,
                              ),
                          );
                        }
                      }}
                      className="w-10 text-center text-sm font-semibold focus:outline-none"
                    />

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-base font-bold"
                      disabled={
                        row.quantity >=
                        currentQuantity
                      }
                      onClick={() =>
                        setLoanItems(
                          (current) =>
                            current.map(
                              (selected) =>
                                selected.inventoryItemId ===
                                row.inventoryItemId
                                  ? {
                                      ...selected,
                                      quantity:
                                        Math.min(
                                          currentQuantity,
                                          selected.quantity +
                                            1,
                                        ),
                                    }
                                  : selected,
                            ),
                        )
                      }
                    >
                      +
                    </Button>
                  </div>

                  {/* HAPUS */}
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() =>
                      setLoanItems(
                        (current) =>
                          current.filter(
                            (selected) =>
                              selected.inventoryItemId !==
                              row.inventoryItemId,
                          ),
                      )
                    }
                  >
                    Hapus
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* CATATAN */}
      <Field label="Catatan (opsional)">
        <textarea
          className="min-h-20 w-full resize-y rounded-xl border bg-background px-3 py-2"
          value={notes}
          onChange={(event) =>
            setNotes(event.target.value)
          }
        />
      </Field>

      {/* FOTO */}
      <Field label="Foto serah-terima (opsional)">
        <ImageUploadField
          file={file}
          onChange={setFile}
        />
      </Field>

      {/* SUBMIT */}
      <Button
        type="submit"
        disabled={isPending}
        className="w-full"
      >
        {isPending
          ? "Menyimpan..."
          : "Buat peminjaman"}
      </Button>
    </form>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium">
      <span>{label}</span>
      {children}
    </label>
  );
}