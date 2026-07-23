import { LoanPage } from "@/features/loans/loan-page";
import { getLoanableItems, getLoans, getOutstandingLoanItems } from "@/features/loans/loan-queries";
import type { LoanParams, LoanView } from "@/features/loans/loan-types";

type PageProps = { searchParams: Promise<LoanParams> };

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;
  const activeView: LoanView = params.view === "returns" || params.view === "history" || params.view === "attention" ? params.view : "active";
  const loanStatus = activeView === "history" ? "closed" : "active";
  const [loans, items, outstandingItems] = await Promise.all([
    getLoans({ ...params, status: loanStatus }),
    getLoanableItems(),
    getOutstandingLoanItems(),
  ]);

  return <LoanPage loans={loans} items={items} outstandingItems={outstandingItems} activeView={activeView} />;
}