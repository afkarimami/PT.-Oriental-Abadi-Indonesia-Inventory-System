import { DashboardPage } from "@/features/dashboard/dashboard-page";
import { getDashboardInventoryOverview } from "@/features/dashboard/dashboard-queries";

export default async function Home() {
  const overview = await getDashboardInventoryOverview();
  return <DashboardPage overview={overview} />;
}