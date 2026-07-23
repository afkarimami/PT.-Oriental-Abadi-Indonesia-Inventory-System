import { createClient } from "@/lib/supabase/server";
import type { LoanActivityReport, StockMovementReport } from "./report-types";

export async function getStockMovementReports(): Promise<StockMovementReport[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("stock_movements").select("id, quantity, quantity_before, quantity_after, notes, created_at, inventory_items(name, code, racks(code))").order("created_at", { ascending: false }).limit(500);
  return (data ?? []).map((movement) => {
    const item = Array.isArray(movement.inventory_items) ? movement.inventory_items[0] ?? null : movement.inventory_items;
    const rack = item && (Array.isArray(item.racks) ? item.racks[0] ?? null : item.racks);
    if (!item || !rack) return null;
    return { id: movement.id, itemName: item.name, itemCode: item.code, rackCode: rack.code, quantity: movement.quantity, quantityBefore: movement.quantity_before, quantityAfter: movement.quantity_after, notes: movement.notes, createdAt: movement.created_at };
  }).filter((movement): movement is StockMovementReport => movement !== null);
}

export async function getLoanActivityReports(): Promise<LoanActivityReport[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("loans").select("id, borrower_name, loaned_at, loan_items(id, quantity_borrowed, inventory_items(name, code))").order("loaned_at", { ascending: false }).limit(500);
  return (data ?? []).flatMap((loan) => (loan.loan_items ?? []).map((item) => {
    const inventoryItem = Array.isArray(item.inventory_items) ? item.inventory_items[0] ?? null : item.inventory_items;
    if (!inventoryItem) return null;
    return { id: item.id, itemName: inventoryItem.name, itemCode: inventoryItem.code, quantity: item.quantity_borrowed, borrowerName: loan.borrower_name, loanedAt: loan.loaned_at };
  }).filter((item): item is LoanActivityReport => item !== null));
}