import Link from "next/link";
import { PageContainer } from "@/components/layout/page-container";
import { PageTitle } from "@/components/shared/page-title";
import { cn } from "@/lib/utils";
import { LoanHistoryList } from "./loan-history-list";
import { LoanList } from "./loan-list";
import { LoanReturnList } from "./loan-return-list";
import type { LoanListRecord, LoanableItem, LoanView, OutstandingLoanItem } from "./loan-types";

type LoanPageProps = {
  loans: LoanListRecord[];
  items: LoanableItem[];
  outstandingItems: OutstandingLoanItem[];
  activeView: LoanView;
};

const viewContent = {
  active: { label: "Sedang Dipinjam", description: "Buat peminjaman baru, pantau alat yang keluar, dan buka transaksi untuk menyelesaikan pengembalian." },
  returns: { label: "Pengembalian", description: "Pilih alat yang sudah diterima admin untuk menyelesaikan pengembaliannya." },
  attention: { label: "Perlu perhatian", description: "Pantau peminjaman yang terlambat atau tenggat pengembaliannya sudah dekat." },
  history: { label: "Riwayat", description: "Lihat transaksi yang seluruh alatnya sudah selesai diproses." },
};

export function LoanPage({ loans, items, outstandingItems, activeView }: LoanPageProps) {
  const currentView = viewContent[activeView];

  return <PageContainer><PageTitle eyebrow="Serah terima alat" title="Transaksi Alat" description={currentView.description} className="mb-6" /><div className="mb-5 inline-flex flex-wrap rounded-xl bg-muted p-1"><Link href="/loans" className={cn("rounded-lg px-4 py-2 text-sm font-semibold text-muted-foreground", activeView === "active" && "bg-card text-primary shadow-sm")}>Sedang Dipinjam</Link><Link href="/loans?view=attention" className={cn("rounded-lg px-4 py-2 text-sm font-semibold text-muted-foreground", activeView === "attention" && "bg-card text-primary shadow-sm")}>Perlu perhatian</Link><Link href="/loans?view=returns" className={cn("rounded-lg px-4 py-2 text-sm font-semibold text-muted-foreground", activeView === "returns" && "bg-card text-primary shadow-sm")}>Pengembalian</Link><Link href="/loans?view=history" className={cn("rounded-lg px-4 py-2 text-sm font-semibold text-muted-foreground", activeView === "history" && "bg-card text-primary shadow-sm")}>Riwayat</Link></div><h2 className="mb-4 text-xl font-bold">{currentView.label}</h2>{activeView === "returns" ? <LoanReturnList items={outstandingItems} /> : activeView === "history" ? <LoanHistoryList loans={loans} /> : <LoanList loans={loans} items={items} attentionMode={activeView === "attention"} />}</PageContainer>;
}