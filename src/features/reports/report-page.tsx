import { PageContainer } from "@/components/layout/page-container";
import { PageTitle } from "@/components/shared/page-title";
import type { LoanActivityReport, StockMovementReport } from "./report-types";
import { ReportDashboard } from "./report-dashboard";

type ReportPageProps = { movements: StockMovementReport[]; loans: LoanActivityReport[] };

export function ReportPage({ movements, loans }: ReportPageProps) {
  return <PageContainer><PageTitle eyebrow="Transparansi inventaris" title="Laporan Aktivitas Inventaris" description="Pantau barang masuk dan peminjaman berdasarkan waktu, rak, serta jenis barang." className="mb-6" /><ReportDashboard movements={movements} loans={loans} /></PageContainer>;
}