import { notFound } from "next/navigation";
import { LoanDetailPage } from "@/features/loans/loan-detail-page";
import { getLoanById } from "@/features/loans/loan-queries";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ loanId: string }>;
};

export default async function Page({ params }: PageProps) {
  const { loanId } = await params;
  const loan = await getLoanById(loanId);

  if (!loan) {
    notFound();
  }

  const ComponentToRender = LoanDetailPage as any;
  return <ComponentToRender loan={loan} />;
}