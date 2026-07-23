import { PageContainer } from "@/components/layout/page-container";
import { PageTitle } from "@/components/shared/page-title";
import type { DashboardInventoryOverview } from "./dashboard-queries";
import { ActivitySummary } from "./activity-summary";
import { DashboardSummary } from "./dashboard-summary";
import { InformationBoard } from "./information-board";

export function DashboardPage({ overview }: { overview: DashboardInventoryOverview }) {
  return <PageContainer><PageTitle eyebrow="Dashboard admin" title="Pantau inventaris dengan cepat" description="Lihat stok tersedia, kondisi yang perlu dicek, dan akses susunan rak dari satu halaman." className="mb-6" /><DashboardSummary overview={overview} /><div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]"><InformationBoard overview={overview} /><ActivitySummary overview={overview} /></div></PageContainer>;
}