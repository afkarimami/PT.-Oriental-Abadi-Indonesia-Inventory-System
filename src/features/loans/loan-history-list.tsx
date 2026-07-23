import Link from "next/link";
import { CheckCircle2, ChevronRight } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import type { LoanListRecord } from "./loan-types";

export function LoanHistoryList({ loans }: { loans: LoanListRecord[] }) {
  if (loans.length === 0) {
    return <EmptyState title="Belum ada transaksi selesai" description="Transaksi yang seluruh alatnya sudah diproses akan tampil di sini." />;
  }

  return <section className="overflow-hidden rounded-2xl border bg-card"><div className="divide-y">{loans.map((loan) => <Link key={loan.id} href={"/loans/" + loan.id} className="flex items-center gap-4 p-4 transition hover:bg-muted/50"><span className="grid size-10 place-items-center rounded-xl bg-emerald-50 text-emerald-600"><CheckCircle2 className="size-5" /></span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="font-mono text-xs font-semibold text-primary">{loan.code}</p><Badge variant="secondary">Selesai</Badge></div><p className="mt-1 font-semibold">{loan.borrowerName}</p><p className="text-sm text-muted-foreground">{loan.purpose} - {loan.itemCount} jenis alat sudah diproses</p></div><div className="hidden text-right text-sm sm:block"><p>{loan.closedAt ? "Selesai " + new Date(loan.closedAt).toLocaleDateString("id-ID") : "Selesai"}</p><p className="text-muted-foreground">{loan.borrowerPhone}</p></div><ChevronRight className="size-5 text-muted-foreground" /></Link>)}</div></section>;
}
