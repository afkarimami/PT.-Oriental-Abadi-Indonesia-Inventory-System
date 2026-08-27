import { createClient } from "@/lib/supabase/server";
import type {
  InventoryItem,
  InventoryPagination,
  InventoryParams,
  InventoryRackDetail,
  InventoryRackSummary,
  InventorySearchItem,
  InventoryStockExportItem,
} from "./inventory-types";
import { unstable_noStore as noStore } from "next/cache";

function getPagination(params: InventoryParams) {
  const pageSize = [10, 25, 50].includes(Number(params.pageSize)) ? Number(params.pageSize) : 12;
  const page = Math.max(1, Number(params.page) || 1);
  return { page, pageSize };
}

export async function getInventoryItems(
  params: InventoryParams
): Promise<{ records: InventoryItem[]; pagination: InventoryPagination }> {
  noStore();
  const supabase = await createClient();
  const { page, pageSize } = getPagination(params);

  let query = supabase
    .from("inventory_items")
    .select(
      "id, code, name, item_type, initial_quantity, used_quantity, added_quantity, current_quantity, source_note, is_active, racks(code, name)",
      { count: "exact" }
    );

  const search = params.search?.trim().replace(/[,%()]/g, " ");
  if (search) {
    query = query.or(`code.ilike.%${search}%,name.ilike.%${search}%,source_note.ilike.%${search}%`);
  }
  if (params.type) {
    query = query.eq("item_type", params.type);
  }
  if (params.rack) {
    query = query.eq("rack_id", params.rack);
  }

  const { data, count, error } = await query
    .order("code")
    .range((page - 1) * pageSize, page * pageSize - 1);

  if (error) {
    console.error("Error fetching inventory items:", error);
  }

  const records = (data ?? []).map((row: any) => {
    const rack = Array.isArray(row.racks) ? row.racks[0] ?? null : row.racks;
    return {
      id: row.id,
      code: row.code,
      name: row.name,
      itemType: row.item_type,
      initialQuantity: row.initial_quantity,
      usedQuantity: row.used_quantity,
      addedQuantity: row.added_quantity,
      currentQuantity: row.current_quantity,
      sourceNote: row.source_note,
      isActive: row.is_active ?? true,
      rack: {
        code: rack?.code ?? "-",
        name: rack?.name ?? "Tanpa Rak",
      },
    };
  });

  return { records, pagination: { page, pageSize, total: count ?? records.length } };
}

export async function getInventoryRackById(rackId: string): Promise<InventoryRackDetail | null> {
  const supabase = await createClient();
  const { data: rack, error } = await supabase
    .from("racks")
    .select("id, code, name")
    .eq("id", rackId)
    .maybeSingle();

  if (error || !rack) return null;
  return { id: rack.id, code: rack.code, name: rack.name, locationName: "Kantor pusat" };
}

export async function getAvailableInventoryItems(): Promise<InventoryItem[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("inventory_items")
    .select(
      "id, code, name, item_type, initial_quantity, used_quantity, added_quantity, current_quantity, source_note, is_active, racks(code, name)"
    )
    .gt("current_quantity", 0)
    .order("name")
    .limit(1000);

  return (data ?? []).map((row: any) => {
    const rack = Array.isArray(row.racks) ? row.racks[0] ?? null : row.racks;
    return {
      id: row.id,
      code: row.code,
      name: row.name,
      itemType: row.item_type,
      initialQuantity: row.initial_quantity,
      usedQuantity: row.used_quantity,
      addedQuantity: row.added_quantity,
      currentQuantity: row.current_quantity,
      sourceNote: row.source_note,
      isActive: row.is_active ?? true,
      rack: {
        code: rack?.code ?? "-",
        name: rack?.name ?? "Tanpa Rak",
      },
    };
  });
}

export async function getInventorySearchItems(): Promise<InventorySearchItem[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("inventory_items")
    .select("id, code, name, item_type, rack_id, current_quantity, racks(code)")
    .order("name")
    .limit(1000);

  return (data ?? []).map((item: any) => {
    const rack = Array.isArray(item.racks) ? item.racks[0] ?? null : item.racks;
    return {
      id: item.id,
      code: item.code,
      name: item.name,
      rackId: item.rack_id,
      rackCode: rack?.code ?? "-",
      itemType: item.item_type,
      currentQuantity: item.current_quantity,
    };
  });
}

export async function getInventoryStockExportItems(): Promise<InventoryStockExportItem[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("inventory_items")
    .select(
      "code, name, item_type, initial_quantity, used_quantity, added_quantity, current_quantity, racks(code)"
    )
    .order("rack_id")
    .order("code")
    .limit(1000);

  return (data ?? []).map((item: any) => {
    const rack = Array.isArray(item.racks) ? item.racks[0] ?? null : item.racks;
    const initialQuantity = item.initial_quantity;
    const addedQuantity = item.added_quantity;
    const usedQuantity =
      item.current_quantity === null
        ? item.used_quantity
        : Math.max((initialQuantity ?? 0) + (addedQuantity ?? 0) - item.current_quantity, 0);
    return {
      code: item.code,
      name: item.name,
      rackCode: rack?.code ?? "-",
      itemType: item.item_type,
      initialQuantity,
      usedQuantity,
      addedQuantity,
      currentQuantity: item.current_quantity,
    };
  });
}

export async function getInventoryRackSummaries(): Promise<InventoryRackSummary[]> {
  const supabase = await createClient();
  const [{ data: racks }, { data: items }] = await Promise.all([
    supabase.from("racks").select("id, code, name").order("code"),
    supabase.from("inventory_items").select("rack_id, current_quantity"),
  ]);

  const itemStats = new Map<
    string,
    { itemCount: number; totalQuantity: number; missingQuantityItems: number }
  >();

  for (const item of items ?? []) {
    const stats = itemStats.get(item.rack_id) ?? {
      itemCount: 0,
      totalQuantity: 0,
      missingQuantityItems: 0,
    };
    stats.itemCount += 1;
    stats.totalQuantity += Math.max(item.current_quantity ?? 0, 0);
    if (item.current_quantity === null) stats.missingQuantityItems += 1;
    itemStats.set(item.rack_id, stats);
  }

  return (racks ?? []).map((rack) => {
    const stats = itemStats.get(rack.id) ?? {
      itemCount: 0,
      totalQuantity: 0,
      missingQuantityItems: 0,
    };
    return { id: rack.id, code: rack.code, name: rack.name, locationName: "Kantor pusat", ...stats };
  });
}