import LoanPage from "@/features/loans/loan-page";
import { getLoanableItems, getLoans, getOutstandingLoanItems } from "@/features/loans/loan-queries";
import type { LoanParams, LoanView } from "@/features/loans/loan-types";

type PageProps = {
  searchParams: Promise<LoanParams> | LoanParams;
};

export default async function Page({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const activeView: LoanView = (resolvedParams?.view as LoanView) || "active";

  const [loans, items, outstandingItems] = await Promise.all([
    getLoans(),
    getLoanableItems(),
    getOutstandingLoanItems(),
  ]);

  return (
    <LoanPage
      loans={loans}
      items={items}
      outstandingItems={outstandingItems}
      activeView={activeView}
    />
  );
}