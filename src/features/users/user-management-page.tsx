import { PageContainer } from "@/components/layout/page-container";
import { PageTitle } from "@/components/shared/page-title";
import type { AdminSummary } from "@/types";
import type { UserManagementData } from "./user-types";
import { UserManagementTable } from "./user-management-table";

type UserManagementPageProps = { data: UserManagementData; admin: AdminSummary };

export function UserManagementPage({ data, admin }: UserManagementPageProps) {
  return <PageContainer><PageTitle eyebrow="Akses sistem" title="Pengguna" description="Kelola siapa yang boleh masuk ke sistem inventaris." className="mb-6" />{data.configured ? <UserManagementTable accounts={data.accounts} currentUserId={admin.id} /> : <section className="max-w-2xl rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-950"><h2 className="font-semibold">Fitur undangan belum dihubungkan</h2><p className="mt-2 text-sm leading-6">Tambahkan <code>SUPABASE_SERVICE_ROLE_KEY</code> pada <code>.env.local</code>, lalu jalankan ulang aplikasi. Kunci ini hanya dibaca server dan tidak boleh dibagikan atau dipasang di browser.</p></section>}</PageContainer>;
}