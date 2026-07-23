import { createClient } from "@/lib/supabase/server";
import type { MasterDataParams, Pagination, RackRecord } from "../master-data-types";

function getPagination(params: MasterDataParams) {
  const pageSize = [10, 25, 50].includes(Number(params.pageSize)) ? Number(params.pageSize) : 10;
  const page = Math.max(1, Number(params.page) || 1);
  return { page, pageSize };
}

export async function getRacks(params: MasterDataParams): Promise<{ records: RackRecord[]; pagination: Pagination }> {
  const supabase = await createClient();
  const { page, pageSize } = getPagination(params);
  let query = supabase.from("racks").select("id, code, name, description, is_active, created_at", { count: "exact" });
  const search = params.search?.trim().replace(/[,%()]/g, " ");

  if (search) query = query.or(`code.ilike.%${search}%,name.ilike.%${search}%,description.ilike.%${search}%`);
  if (params.status === "active") query = query.eq("is_active", true);
  if (params.status === "inactive") query = query.eq("is_active", false);

  const { data, count } = await query.order("code").range((page - 1) * pageSize, page * pageSize - 1);
  const records = (data ?? []).map((row) => ({
    id: row.id,
    code: row.code,
    name: row.name,
    description: row.description,
    isActive: row.is_active,
    createdAt: row.created_at,
  }));

  return { records, pagination: { page, pageSize, total: count ?? 0 } };
}