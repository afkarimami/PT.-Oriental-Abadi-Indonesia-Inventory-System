import { createClient } from "@/lib/supabase/server";

export type DashboardActivityType = "stock_in" | "loan" | "return";

export type DashboardActivity = {
  id: string;
  type: DashboardActivityType;
  title: string;
  description: string;
  timestamp: string;
  href: string;
};

export type DashboardInventoryOverview = {
  totalItems: number;
  availableUnits: number;
  borrowedItems: number;
  activeLoanCount: number;
  recentStockInCount: number;
  recentReturnCount: number;
  activityFeed: DashboardActivity[];
  needsAttention: number;
  missingQuantityItems: number;
  emptyStockItems: number;
  overdueLoanCount: number;
  dueSoonLoanCount: number;
};

export async function getDashboardInventoryOverview(): Promise<DashboardInventoryOverview> {
  const supabase = await createClient();
  const [{ data: inventoryItems }, { data: loanItems }, { data: returnRecords }, { data: stockMovements }] = await Promise.all([
    supabase.from("inventory_items").select("current_quantity").eq("is_active", true),
    supabase.from("loan_items").select("loan_id, quantity_borrowed, quantity_returned, quantity_damaged, quantity_lost, inventory_items(name, code), loans!inner(id, borrower_name, purpose, expected_return_on, loaned_at, status)").eq("loans.status", "active"),
    supabase.from("loan_item_returns").select("id, quantity_good, created_at, loan_items!inner(loan_id, inventory_items(name, code), loans!inner(id, borrower_name, purpose))").gt("quantity_good", 0).order("created_at", { ascending: false }).limit(10),
    supabase.from("stock_movements").select("id, quantity, quantity_after, notes, created_at, inventory_items(name, code, racks(code))").eq("movement_type", "stock_in").order("created_at", { ascending: false }).limit(10),
  ]);

  const records = inventoryItems ?? [];
  const activeLoanItems = loanItems ?? [];
  const today = new Date().toISOString().slice(0, 10);
  const dueSoon = new Date();
  dueSoon.setDate(dueSoon.getDate() + 2);
  const dueSoonDate = dueSoon.toISOString().slice(0, 10);
  const attentionLoans = new Map<string, "overdue" | "due_soon">();
  const activeLoans = new Map<string, { id: string; borrowerName: string; purpose: string; expectedReturnOn: string | null; loanedAt: string; items: string[] }>();

  for (const item of activeLoanItems) {
    const loan = Array.isArray(item.loans) ? item.loans[0] ?? null : item.loans;
    const inventoryItem = Array.isArray(item.inventory_items) ? item.inventory_items[0] ?? null : item.inventory_items;
    const quantity = item.quantity_borrowed - item.quantity_returned - item.quantity_damaged - item.quantity_lost;
    if (!loan || !inventoryItem || quantity <= 0) continue;
    if (loan.expected_return_on) {
      if (loan.expected_return_on < today) attentionLoans.set(loan.id, "overdue");
      else if (loan.expected_return_on <= dueSoonDate) attentionLoans.set(loan.id, "due_soon");
    }
    const current = activeLoans.get(loan.id) ?? { id: loan.id, borrowerName: loan.borrower_name, purpose: loan.purpose, expectedReturnOn: loan.expected_return_on, loanedAt: loan.loaned_at, items: [] as string[] };
    current.items.push(`${inventoryItem.name} x${quantity}`);
    activeLoans.set(loan.id, current);
  }

  const loanActivities: DashboardActivity[] = Array.from(activeLoans.values()).map((loan) => ({
    id: `loan-${loan.id}`,
    type: "loan",
    title: loan.borrowerName,
    description: `Meminjam ${loan.items.join(", ")} untuk ${loan.purpose}.${loan.expectedReturnOn ? ` Rencana kembali ${new Date(loan.expectedReturnOn).toLocaleDateString("id-ID")}.` : ""}`,
    timestamp: loan.loanedAt,
    href: `/loans/${loan.id}`,
  }));

  const returnActivities: DashboardActivity[] = (returnRecords ?? []).map((record) => {
    const loanItem = Array.isArray(record.loan_items) ? record.loan_items[0] ?? null : record.loan_items;
    const loan = loanItem && (Array.isArray(loanItem.loans) ? loanItem.loans[0] ?? null : loanItem.loans);
    const inventoryItem = loanItem && (Array.isArray(loanItem.inventory_items) ? loanItem.inventory_items[0] ?? null : loanItem.inventory_items);
    if (!loan || !inventoryItem) return null;
    return { id: `return-${record.id}`, type: "return", title: loan.borrower_name, description: `Mengembalikan ${inventoryItem.name} x${record.quantity_good} untuk ${loan.purpose}.`, timestamp: record.created_at, href: `/loans/${loan.id}` };
  }).filter((activity): activity is DashboardActivity => activity !== null);

  const stockActivities: DashboardActivity[] = (stockMovements ?? []).map((movement) => {
    const item = Array.isArray(movement.inventory_items) ? movement.inventory_items[0] ?? null : movement.inventory_items;
    const rack = item && (Array.isArray(item.racks) ? item.racks[0] ?? null : item.racks);
    if (!item || !rack) return null;
    return { id: `stock-${movement.id}`, type: "stock_in", title: `${item.name} +${movement.quantity}`, description: `Barang masuk di Rak ${rack.code}. Stok sekarang ${movement.quantity_after}.${movement.notes ? ` ${movement.notes}` : ""}`, timestamp: movement.created_at, href: "/reports" };
  }).filter((activity): activity is DashboardActivity => activity !== null);

  const overdueLoanCount = Array.from(attentionLoans.values()).filter((status) => status === "overdue").length;
  const dueSoonLoanCount = Array.from(attentionLoans.values()).filter((status) => status === "due_soon").length;
  const borrowedItems = activeLoanItems.reduce((total, item) => total + item.quantity_borrowed - item.quantity_returned - item.quantity_damaged - item.quantity_lost, 0);

  return {
    totalItems: records.length,
    availableUnits: records.reduce((total, record) => total + Math.max(record.current_quantity ?? 0, 0), 0),
    borrowedItems,
    activeLoanCount: activeLoans.size,
    recentStockInCount: stockActivities.length,
    recentReturnCount: returnActivities.length,
    activityFeed: [...stockActivities, ...loanActivities, ...returnActivities].sort((first, second) => new Date(second.timestamp).getTime() - new Date(first.timestamp).getTime()).slice(0, 20),
    needsAttention: overdueLoanCount + dueSoonLoanCount,
    missingQuantityItems: records.filter((record) => record.current_quantity === null).length,
    emptyStockItems: records.filter((record) => record.current_quantity === 0).length,
    overdueLoanCount,
    dueSoonLoanCount,
  };
}