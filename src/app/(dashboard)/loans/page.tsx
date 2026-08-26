import { notFound } from "next/navigation";
import { LoanDetailPage } from "@/features/loans/loan-detail-page";
import { getLoanById } from "@/features/loans/loan-queries";

type PageProps = { params: Promise<{ loanId: string }> };

export default async function Page({ params }: PageProps) {
  const resolvedParams = await params;
  const loanId = resolvedParams.loanId;

  const loan = await getLoanById(loanId);

  if (!loan) {
    notFound();
  }

  // Menggunakan cast any agar TypeScript tidak protes soal nama properti props
  const ComponentToRender = LoanDetailPage as any;
  return <ComponentToRender loan={loan} />;
}