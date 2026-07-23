import { ReportPage } from "@/features/reports/report-page";
import { getLoanActivityReports, getStockMovementReports } from "@/features/reports/report-queries";

export default async function Page() {
  const [movements, loans] = await Promise.all([getStockMovementReports(), getLoanActivityReports()]);
  return <ReportPage movements={movements} loans={loans} />;
}