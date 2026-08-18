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

type LoanListProps = { loans: LoanListRecord[]; items: LoanableItem[]; attentionMode?: boolean };
type LoanItemInput = { inventoryItemId: string; quantity: number };

const statusLabel = { active: "Sedang dipinjam", closed: "Selesai", overdue: "Terlambat" };

export function LoanList({ loans, items, attentionMode = false }: LoanListProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const activeCount = loans.length;
  const overdueCount = loans.filter((loan) => loan.status === "overdue").length; const borrowedQuantity = loans.reduce((total, loan) => total + loan.outstandingQuantity, 0);

  const updateParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => value ? params.set(key, value) : params.delete(key));
    router.push(pathname + "?" + params.toString());
  };

  return (
    <section className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-3"><Summary label={attentionMode ? "Perlu ditindaklanjuti" : "Transaksi aktif"} value={activeCount} /><Summary label="Terlambat" value={overdueCount} alert /><Summary label="Barang masih dipinjam" value={borrowedQuantity} /></div>
      <div className="flex flex-col gap-3 rounded-2xl border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
        <form className="relative w-full sm:max-w-md" onSubmit={(event) => { event.preventDefault(); updateParams({ search: new FormData(event.currentTarget).get("search")?.toString() ?? "" }); }}><Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" /><Input name="search" defaultValue={searchParams.get("search") ?? ""} className="h-10 rounded-xl pl-9" placeholder="Cari peminjam, keperluan, atau kode transaksi" /></form>
        <Button type="button" className="rounded-xl" onClick={() => setIsOpen(true)}><Plus />Buat peminjaman</Button>
      </div>
      <div className="overflow-hidden rounded-2xl border bg-card"><div className="divide-y">{loans.length === 0 ? <p className="p-8 text-center text-sm text-muted-foreground">Belum ada transaksi aktif. Buat peminjaman baru saat alat diserahkan.</p> : loans.map((loan) => <Link key={loan.id} href={"/loans/" + loan.id} className="flex items-center gap-4 p-4 transition hover:bg-muted/50"><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><p className="font-mono text-xs font-semibold text-primary">{loan.code}</p><StatusBadge status={loan.status} />{loan.attentionStatus === "due_soon" && <Badge variant="secondary">Tenggat dekat</Badge>}</div><p className="mt-1 font-semibold">{loan.borrowerName}</p><p className="text-sm text-muted-foreground">{loan.purpose} - {loan.itemCount} jenis alat, {loan.outstandingQuantity} masih dipinjam</p></div><div className="hidden text-right text-sm sm:block"><p>{loan.expectedReturnOn ? "Kembali " + new Date(loan.expectedReturnOn).toLocaleDateString("id-ID") : "Tanpa jadwal kembali"}</p><p className="text-muted-foreground">{loan.borrowerPhone}</p></div><ChevronRight className="size-5 text-muted-foreground" /></Link>)}</div></div>
      <FormDialog open={isOpen} onOpenChange={setIsOpen} title="Buat peminjaman" description="Stok barang otomatis berkurang setelah transaksi disimpan."><LoanForm items={items} onSuccess={(loanId) => { setIsOpen(false); router.push("/loans/" + loanId); }} /></FormDialog>
    </section>
  );
}

function Summary({ label, value, alert = false }: { label: string; value: number; alert?: boolean }) { return <div className={"rounded-2xl border p-4 " + (alert && value > 0 ? "border-amber-200 bg-amber-50" : "bg-card")}><p className="text-sm text-muted-foreground">{label}</p><p className="mt-2 text-2xl font-bold">{value}</p></div>; }
function StatusBadge({ status }: { status: keyof typeof statusLabel }) { return <Badge variant={status === "overdue" ? "destructive" : status === "closed" ? "secondary" : "default"}>{statusLabel[status]}</Badge>; }

function LoanForm({ items, onSuccess }: { items: LoanableItem[]; onSuccess: (loanId: string) => void }) {
  const [borrowerName, setBorrowerName] = useState("");
  const [borrowerPhone, setBorrowerPhone] = useState("");
  const [borrowerOrganization, setBorrowerOrganization] = useState("");
  const [purpose, setPurpose] = useState("");
  const [expectedReturnOn, setExpectedReturnOn] = useState("");
  const [notes, setNotes] = useState("");
  const [itemSearch, setItemSearch] = useState("");
  const [loanItems, setLoanItems] = useState<LoanItemInput[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [isPending, setIsPending] = useState(false);
  const selectedItemIds = new Set(loanItems.map((item) => item.inventoryItemId));
  const searchResults = itemSearch.trim()
    ? items.filter((item) => !selectedItemIds.has(item.id) && (item.name + " " + item.code + " " + item.rackCode).toLowerCase().includes(itemSearch.toLowerCase())).slice(0, 8)
    : [];

  const addItem = (item: LoanableItem) => {
    setLoanItems((current) => [...current, { inventoryItemId: item.id, quantity: 1 }]);
    setItemSearch("");
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (loanItems.length === 0) return toast.error("Cari lalu pilih minimal satu barang.");
    setIsPending(true);
    try {
      const documentationPath = file ? await uploadLoanDocumentation(file) : undefined;
      const result = await createLoan({ borrowerName, borrowerPhone, borrowerOrganization, purpose, expectedReturnOn, notes, documentationPath, items: loanItems });
      if (!result.success || !result.loanId) return toast.error(result.message);
      toast.success(result.message);
      onSuccess(result.loanId);
    } catch (error) { toast.error(error instanceof Error ? error.message : "Peminjaman gagal dicatat."); } finally { setIsPending(false); }
  };

  return <form className="grid gap-4" onSubmit={submit}><Field label="Nama peminjam"><Input value={borrowerName} onChange={(event) => setBorrowerName(event.target.value)} required /></Field><Field label="Nomor HP"><Input type="tel" value={borrowerPhone} onChange={(event) => setBorrowerPhone(event.target.value)} required /></Field><Field label="Instansi (opsional)"><Input value={borrowerOrganization} onChange={(event) => setBorrowerOrganization(event.target.value)} placeholder="Untuk peminjam dari luar" /></Field><Field label="Keperluan"><Input value={purpose} onChange={(event) => setPurpose(event.target.value)} required /></Field><Field label="Rencana kembali (opsional)"><Input type="date" value={expectedReturnOn} onChange={(event) => setExpectedReturnOn(event.target.value)} /></Field><Field label="Cari barang"><div className="relative"><Search className="pointer-events-none absolute top-1/2 left-3 z-10 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={itemSearch} onChange={(event) => setItemSearch(event.target.value)} className="pl-9" placeholder="Ketik nama atau kode barang" autoComplete="off" />{itemSearch && <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-xl border bg-popover shadow-lg">{searchResults.length === 0 ? <p className="px-3 py-3 text-sm text-muted-foreground">Barang tidak ditemukan atau sudah dipilih.</p> : searchResults.map((item) => <button key={item.id} type="button" onClick={() => addItem(item)} className="flex w-full items-center justify-between gap-3 px-3 py-3 text-left text-sm hover:bg-muted"><span className="min-w-0"><span className="block truncate font-medium">{item.name}</span><span className="block font-mono text-xs text-muted-foreground">{item.code} - Rak {item.rackCode}</span></span><span className="shrink-0 text-xs text-primary">Tersedia {item.availableQuantity}</span></button>)}</div>}</div></Field><div className="grid gap-2">{loanItems.length === 0 ? <p className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">Belum ada barang dipilih. Gunakan pencarian di atas.</p> : loanItems.map((row) => { const item = items.find((candidate) => candidate.id === row.inventoryItemId); if (!item) return null; return <div key={row.inventoryItemId} className="grid grid-cols-[1fr_76px_auto] items-center gap-2 rounded-xl border p-3"><div className="min-w-0"><p className="truncate text-sm font-semibold">{item.name}</p><p className="font-mono text-xs text-muted-foreground">{item.code} - Rak {item.rackCode} - tersedia {item.availableQuantity}</p></div><Input type="number" min="1" max={item.availableQuantity} value={row.quantity} onChange={(event) => setLoanItems((current) => current.map((selected) => selected.inventoryItemId === row.inventoryItemId ? { ...selected, quantity: Math.min(item.availableQuantity, Math.max(1, Number(event.target.value))) } : selected))} /><Button type="button" variant="ghost" onClick={() => setLoanItems((current) => current.filter((selected) => selected.inventoryItemId !== row.inventoryItemId))}>Hapus</Button></div>; })}</div><Field label="Catatan (opsional)"><textarea className="min-h-20 rounded-xl border bg-background px-3 py-2" value={notes} onChange={(event) => setNotes(event.target.value)} /></Field><Field label="Foto serah-terima (opsional)"><ImageUploadField file={file} onChange={setFile} /></Field><Button type="submit" disabled={isPending}>{isPending ? "Menyimpan..." : "Buat peminjaman"}</Button></form>;
}

function Field({ label, children }: { label: string; children: ReactNode }) { return <label className="grid gap-2 text-sm font-medium"><span>{label}</span>{children}</label>; }
