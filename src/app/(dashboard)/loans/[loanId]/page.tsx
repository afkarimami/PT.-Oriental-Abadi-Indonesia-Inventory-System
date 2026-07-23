import { notFound } from "next/navigation";
import { LoanDetailPage } from "@/features/loans/loan-detail-page";
import { getLoanDetail } from "@/features/loans/loan-queries";

type PageProps = { params: Promise<{ loanId: string }> };

export default async function Page({ params }: PageProps) {
  const { loanId } = await params;
  const loan = await getLoanDetail(loanId);
  if (!loan) notFound();
  return <LoanDetailPage loan={loan} />;
}