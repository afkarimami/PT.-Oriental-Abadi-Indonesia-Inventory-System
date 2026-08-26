"use client";

import { PackagePlus, Search } from "lucide-react";
import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { receiveStock } from "./inventory-actions";
import type { InventoryRackSummary, InventorySearchItem } from "./inventory-types";

type ReceiptMode = "existing" | "new";

const itemTypeLabels = {
  inventory: "Alat inventaris - bisa dipinjam",
  consumable: "Consumable - persediaan habis pakai",
  unclassified: "Perlu klasifikasi",
};

export function StockReceiptDialog({ items = [], racks = [] }: { items: InventorySearchItem[]; racks: InventoryRackSummary[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<ReceiptMode>("existing");
  const [search, setSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState<InventorySearchItem | null>(null);
  const [quantity, setQuantity] = useState<string>("1");
  const [notes, setNotes] = useState("");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [rackId, setRackId] = useState("");
  const [itemType, setItemType] = useState<"inventory" | "consumable">("inventory");
  const [pending, setPending] = useState(false);

  const results = useMemo(
    () =>
      search.trim()
        ? items.filter((item) =>
            (item.name + " " + item.code + " " + item.rackCode).toLowerCase().includes(search.toLowerCase())
          ).slice(0, 7)
        : [],
    [items, search]
  );

  const reset = () => {
    setMode("existing");
    setSearch("");
    setSelectedItem(null);
    setQuantity("1");
    setNotes("");
    setName("");
    setCode("");
    setRackId("");
    setItemType("inventory");
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsedQuantity = Number(quantity);
    if (!parsedQuantity || parsedQuantity < 1) {
      return toast.error("Jumlah harus minimal 1.");
    }

    if (mode === "existing" && !selectedItem) {
      return toast.error("Pilih barang yang sudah ada terlebih dahulu.");
    }

    setPending(true);
    const result = await receiveStock({
      mode,
      existingItemId: selectedItem?.id,
      rackId: mode === "new" ? (rackId || undefined) : selectedItem?.rackId,
      name: mode === "new" ? (name || undefined) : selectedItem?.name,
      code: mode === "new" ? (code || undefined) : selectedItem?.code,
      itemType: mode === "existing" ? (selectedItem?.itemType === "consumable" ? "consumable" : "inventory") : itemType,
      quantity: parsedQuantity,
      notes: notes || undefined,
    });
    setPending(false);

    if (!result.success) return toast.error(result.message);
    toast.success(result.message);
    reset();
    setOpen(false);
    router.refresh();
  };

  return (
    <>
      <Button type="button" className="gap-2 rounded-xl" onClick={() => setOpen(true)}>
        <PackagePlus className="size-4" />
        Barang Masuk
      </Button>

      <Dialog
        open={open}
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen);
          if (!nextOpen) reset();
        }}
      >
        <DialogContent className="max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle>Barang Masuk</DialogTitle>
            <DialogDescription>
              Stok, laporan, dan papan informasi diperbarui otomatis setelah disimpan.
            </DialogDescription>
          </DialogHeader>

          <form className="grid gap-4" onSubmit={submit}>
            <div className="grid grid-cols-2 rounded-xl bg-muted p-1">
              <button
                type="button"
                onClick={() => setMode("existing")}
                className={cn("rounded-lg px-3 py-2 text-sm font-semibold transition-all", mode === "existing" && "bg-card text-primary shadow-sm")}
              >
                Tambah stok
              </button>
              <button
                type="button"
                onClick={() => setMode("new")}
                className={cn("rounded-lg px-3 py-2 text-sm font-semibold transition-all", mode === "new" && "bg-card text-primary shadow-sm")}
              >
                Barang baru
              </button>
            </div>

            {mode === "existing" ? (
              <>
                <Field label="Cari barang yang sudah ada">
                  <div className="relative">
                    <Search className="pointer-events-none absolute top-1/2 left-3 z-10 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={search}
                      onChange={(event) => {
                        setSearch(event.target.value);
                        setSelectedItem(null);
                      }}
                      className="pl-9"
                      placeholder="Ketik nama atau kode barang"
                      autoComplete="off"
                    />
                    {search && (
                      <div className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-xl border bg-popover shadow-lg">
                        {results.length === 0 ? (
                          <p className="px-3 py-3 text-sm text-muted-foreground">Barang tidak ditemukan.</p>
                        ) : (
                          results.map((item) => (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => {
                                setSelectedItem(item);
                                setSearch("");
                              }}
                              className="flex w-full items-center justify-between gap-3 px-3 py-3 text-left hover:bg-muted"
                            >
                              <span>
                                <span className="block text-sm font-semibold">{item.name}</span>
                                <span className="block font-mono text-xs text-muted-foreground">
                                  {item.code} - Rak {item.rackCode}
                                </span>
                              </span>
                              <span className="text-right text-xs text-muted-foreground">
                                <span className="block">{itemTypeLabels[item.itemType]}</span>
                                <span>Stok {item.currentQuantity ?? "-"}</span>
                              </span>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                  {selectedItem && (
                    <p className="rounded-xl bg-primary/5 p-3 text-sm text-primary border border-primary/20">
                      Dipilih: <strong>{selectedItem.name}</strong> ({selectedItem.code}, Rak {selectedItem.rackCode})
                    </p>
                  )}
                </Field>
                <Field label="Jenis barang">
                  <p className="rounded-xl border bg-muted/50 px-3 py-2.5 text-sm">
                    {selectedItem ? itemTypeLabels[selectedItem.itemType] : "Pilih barang terlebih dahulu"}
                  </p>
                </Field>
              </>
            ) : (
              <>
                <Field label="Nama barang">
                  <Input value={name} onChange={(event) => setName(event.target.value)} required placeholder="Masukkan nama barang" />
                </Field>
                <Field label="Kode barang (opsional)">
                  <Input value={code} onChange={(event) => setCode(event.target.value)} placeholder="Otomatis dibuat bila dikosongkan" />
                </Field>
                <Field label="Rak">
                  <select value={rackId} onChange={(event) => setRackId(event.target.value)} required className="h-10 rounded-xl border bg-background px-3 text-sm">
                    <option value="">Pilih rak</option>
                    {racks.map((rack) => (
                      <option key={rack.id} value={rack.id}>
                        Rak {rack.code}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Jenis barang">
                  <select value={itemType} onChange={(event) => setItemType(event.target.value as "inventory" | "consumable")} className="h-10 rounded-xl border bg-background px-3 text-sm">
                    <option value="inventory">Alat inventaris - bisa dipinjam</option>
                    <option value="consumable">Consumable - persediaan habis pakai</option>
                  </select>
                </Field>
              </>
            )}

            <Field label={mode === "new" ? "Stok awal" : "Jumlah masuk"}>
              <Input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={quantity}
                onChange={(event) => {
                  const rawVal = event.target.value.replace(/[^0-9]/g, "");
                  const cleanVal = rawVal.replace(/^0+/, "");
                  setQuantity(cleanVal);
                }}
                onBlur={() => {
                  if (!quantity || Number(quantity) < 1) {
                    setQuantity("1");
                  }
                }}
                placeholder="1"
                required
              />
            </Field>

            <Field label="Sumber atau catatan (opsional)">
              <textarea
                className="min-h-20 rounded-xl border bg-background px-3 py-2 text-sm"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Contoh: pembelian Agustus 2026"
              />
            </Field>

            <Button type="submit" disabled={pending || (mode === "existing" && !selectedItem)}>
              {pending ? "Menyimpan..." : "Simpan barang masuk"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid gap-2 text-sm font-medium">
      <span>{label}</span>
      {children}
    </label>
  );
}