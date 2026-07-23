import { RackPage } from "@/features/master-data/racks/rack-page";
import { getRacks } from "@/features/master-data/racks/rack-queries";
import type { MasterDataParams } from "@/features/master-data/master-data-types";

type PageProps = { searchParams: Promise<MasterDataParams> };

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;
  const result = await getRacks(params);
  return <RackPage {...result} />;
}