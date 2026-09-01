import { LoanList } from "@/features/loans/loan-list";
import {
  getLoans,
  getLoanableItems,
} from "@/features/loans/loan-queries";

export const dynamic = "force-dynamic";

export default async function LoansPage() {
  const [loans, items] = await Promise.all([
    getLoans(),
    getLoanableItems(),
  ]);

  console.log("=== DATA INVENTORY ===");
  console.log(items);
  console.log("JUMLAH BARANG:", items.length);

  return (
    <LoanList
      loans={loans as any}
      items={items as any}
    />
  );
}