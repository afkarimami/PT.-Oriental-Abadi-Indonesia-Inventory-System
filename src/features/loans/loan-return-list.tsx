import Link from "next/link";
import { CalendarClock, ChevronRight, RotateCcw } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import type { OutstandingLoanItem } from "./loan-types";

export function LoanReturnList({ items }: { items: OutstandingLoanItem[] }) {
  if (items.length === 0) return <EmptyState title="Tidak ada alat yang perlu dikembalikan" description="Semua alat dari transaksi aktif sudah diproses." />;

  return <section className="space-y-4"><div className="rounded-2xl border bg-card p-4"><p className="font-semibold">Pilih alat yang dikembalikan</p><p className="mt-1 text-sm text-muted-foreground">Buka detail transaksi untuk mencatat kondisi baik, rusak, atau hilang.</p></div><div className="space-y-3">{items.map((item) => <Link key={item.id} href={"/loans/" + item.loanId} className="flex items-center gap-4 rounded-2xl border bg-card p-4 transition hover:border-primary/40 hover:bg-muted/30"><span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary"><RotateCcw className="size-5" /></span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="font-semibold">{item.itemName}</p><Badge variant="secondary">x{item.outstandingQuantity}</Badge></div><p className="mt-1 text-xs font-mono text-muted-foreground">{item.itemCode} - Rak {item.rackCode}</p><p className="mt-2 text-sm text-muted-foreground">Dipinjam oleh <span className="font-medium text-foreground">{item.borrowerName}</span> untuk {item.purpose}</p></div><div className="hidden text-right text-xs text-muted-foreground sm:block"><p className="inline-flex items-center gap-1"><CalendarClock className="size-3.5" />{item.expectedReturnOn ? new Date(item.expectedReturnOn).toLocaleDateString("id-ID") : "Tanpa jadwal"}</p><p className="mt-1">{item.borrowerPhone}</p></div><ChevronRight className="size-5 text-muted-foreground" /></Link>)}</div></section>;
}
