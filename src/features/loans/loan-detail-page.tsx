import { notFound } from "next/navigation";
import { getLoanById } from "./loan-queries";
import LoanDetailView from "./loan-detail-view";

interface LoanDetailPageProps {
  params: Promise<{ id?: string; loanId?: string }>;
}

export async function LoanDetailPage({ params }: LoanDetailPageProps) {
  const resolvedParams = await params;
  const id = resolvedParams.loanId || resolvedParams.id;

  if (!id) {
    notFound();
  }

  const loan = await getLoanById(id);

  if (!loan) {
    notFound();
  }

  return <LoanDetailView loan={loan} />;
}

export default LoanDetailPage;