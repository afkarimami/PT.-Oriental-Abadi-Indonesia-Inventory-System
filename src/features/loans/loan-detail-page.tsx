import { PageContainer } from "@/components/layout/page-container";
import { PageTitle } from "@/components/shared/page-title";
import { LoanDetailView } from "./loan-detail-view";
import type { LoanDetail } from "./loan-types";

export function LoanDetailPage({ loan }: { loan: LoanDetail }) {
  return <PageContainer><PageTitle eyebrow="Detail serah terima" title={loan.code} description="Periksa alat yang masih dipinjam dan catat pengembaliannya." className="mb-6" /><LoanDetailView loan={loan} /></PageContainer>;
}
