import LoanDetailPage from "@/features/loans/loan-detail-page";
import type { LoanParams } from "@/features/loans/loan-types";

type PageProps = {
  params: Promise<{ loanId: string }>;
  searchParams?: Promise<LoanParams>;
};

export default function Page({ params }: PageProps) {
  return <LoanDetailPage params={params} />;
}