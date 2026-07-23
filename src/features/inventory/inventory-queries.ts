import { createClient } from "@/lib/supabase/server";
import type { InventoryItem, InventoryPagination, InventoryParams, InventoryRackDetail, InventoryRackSummary, InventorySearchItem, InventoryStockExportItem } from "./inventory-types";

function getPagination(params: InventoryParams) {
  const pageSize = [10, 25, 50].includes(Number(params.pageSize)) ? Number(params.pageSize) : 12;
  const page = Math.max(1, Number(params.page) || 1);
  return { page, pageSize };
}

export async function getInventoryItems(params: InventoryParams): Promise<{ records: InventoryItem[]; pagination: InventoryPagination }> {
  const supabase = await createClient();
  const { page, pageSize } = getPagination(params);
  let query = supabase
    .from("inventory_items")
    .select("id, code, name, item_type, initial_quantity, used_quantity, added_quantity, current_quantity, source_note, is_active, racks(code, name)", { count: "exact" })
    .eq("is_active", true);

  const search = params.search?.trim().replace(/[,%()]/g, " ");
  if (search) query = query.or(`code.ilike.%${search}%,name.ilike.%${search}%,source_note.ilike.%${search}%`);
  if (params.type) query = query.eq("item_type", params.type);
  if (params.rack) query = query.eq("rack_id", params.rack);

  const { data, count } = await query.order("code").range((page - 1) * pageSize, page * pageSize - 1);
  const records = (data ?? []).map((row) => {
    const rack = Array.isArray(row.racks) ? row.racks[0] ?? null : row.racks;
    if (!rack) return null;
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
      isActive: row.is_active,
      rack: { code: rack.code, name: rack.name },
    };
  }).filter((row): row is InventoryItem => row !== null);

  return { records, pagination: { page, pageSize, total: count ?? 0 } };
}

export async function getInventoryRackById(rackId: string): Promise<InventoryRackDetail | null> {
  const supabase = await createClient();
  const { data: rack } = await supabase
    .from("racks")
    .select("id, code, name")
    .eq("id", rackId)
    .eq("is_active", true)
    .maybeSingle();

  if (!rack) return null;
  return { id: rack.id, code: rack.code, name: rack.name, locationName: "Kantor pusat" };
}


export async function getAvailableInventoryItems(): Promise<InventoryItem[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("inventory_items")
    .select("id, code, name, item_type, initial_quantity, used_quantity, added_quantity, current_quantity, source_note, is_active, racks(code, name)")
    .eq("is_active", true)
    .gt("current_quantity", 0)
    .order("name")
    .limit(1000);

  return (data ?? []).map((row) => {
    const rack = Array.isArray(row.racks) ? row.racks[0] ?? null : row.racks;
    if (!rack) return null;
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
      isActive: row.is_active,
      rack: { code: rack.code, name: rack.name },
    };
  }).filter((item): item is InventoryItem => item !== null);
}
export async function getInventorySearchItems(): Promise<InventorySearchItem[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("inventory_items")
    .select("id, code, name, item_type, rack_id, current_quantity, racks(code)")
    .eq("is_active", true)
    .order("name")
    .limit(1000);

  return (data ?? []).map((item) => {
    const rack = Array.isArray(item.racks) ? item.racks[0] ?? null : item.racks;
    if (!rack) return null;
    return { id: item.id, code: item.code, name: item.name, rackId: item.rack_id, rackCode: rack.code, itemType: item.item_type, currentQuantity: item.current_quantity };
  }).filter((item): item is InventorySearchItem => item !== null);
}

export async function getInventoryStockExportItems(): Promise<InventoryStockExportItem[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("inventory_items")
    .select("code, name, item_type, initial_quantity, used_quantity, added_quantity, current_quantity, racks(code)")
    .eq("is_active", true)
    .order("rack_id")
    .order("code")
    .limit(1000);

  return (data ?? []).map((item) => {
    const rack = Array.isArray(item.racks) ? item.racks[0] ?? null : item.racks;
    if (!rack) return null;
    const initialQuantity = item.initial_quantity;
    const addedQuantity = item.added_quantity;
    const usedQuantity = item.current_quantity === null ? item.used_quantity : Math.max((initialQuantity ?? 0) + (addedQuantity ?? 0) - item.current_quantity, 0);
    return { code: item.code, name: item.name, rackCode: rack.code, itemType: item.item_type, initialQuantity, usedQuantity, addedQuantity, currentQuantity: item.current_quantity };
  }).filter((item): item is InventoryStockExportItem => item !== null);
}
export async function getInventoryRackSummaries(): Promise<InventoryRackSummary[]> {
  const supabase = await createClient();
  const [{ data: racks }, { data: items }] = await Promise.all([
    supabase.from("racks").select("id, code, name").eq("is_active", true).order("code"),
    supabase.from("inventory_items").select("rack_id, current_quantity").eq("is_active", true),
  ]);
  const itemStats = new Map<string, { itemCount: number; totalQuantity: number; missingQuantityItems: number }>();
  for (const item of items ?? []) {
    const stats = itemStats.get(item.rack_id) ?? { itemCount: 0, totalQuantity: 0, missingQuantityItems: 0 };
    stats.itemCount += 1;
    stats.totalQuantity += Math.max(item.current_quantity ?? 0, 0);
    if (item.current_quantity === null) stats.missingQuantityItems += 1;
    itemStats.set(item.rack_id, stats);
  }

  return (racks ?? []).map((rack) => {
    const stats = itemStats.get(rack.id) ?? { itemCount: 0, totalQuantity: 0, missingQuantityItems: 0 };
    return { id: rack.id, code: rack.code, name: rack.name, locationName: "Kantor pusat", ...stats };
  });
}