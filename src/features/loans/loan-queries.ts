import { createClient } from "@/lib/supabase/server";
import type { LoanAttentionStatus, LoanDetail, LoanDetailItem, LoanListRecord, LoanParams, LoanReturnRecord, LoanableItem, LoanStatus, OutstandingLoanItem } from "./loan-types";

function getLoanStatus(status: string, expectedReturnOn: string | null): LoanStatus {
  if (status === "active" && expectedReturnOn && expectedReturnOn < new Date().toISOString().slice(0, 10)) return "overdue";
  return status === "closed" ? "closed" : "active";
}

function getLoanAttentionStatus(expectedReturnOn: string | null): LoanAttentionStatus | null {
  if (!expectedReturnOn) return null;
  const today = new Date().toISOString().slice(0, 10);
  const dueSoon = new Date();
  dueSoon.setDate(dueSoon.getDate() + 2);
  const dueSoonDate = dueSoon.toISOString().slice(0, 10);
  if (expectedReturnOn < today) return "overdue";
  if (expectedReturnOn <= dueSoonDate) return "due_soon";
  return null;
}
async function getDocumentationUrl(path: string | null) {
  if (!path) return null;
  const supabase = await createClient();
  const { data } = await supabase.storage.from("loan-documentation").createSignedUrl(path, 60 * 60);
  return data?.signedUrl ?? null;
}

export async function getLoanableItems(): Promise<LoanableItem[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("inventory_items")
    .select("id, code, name, current_quantity, racks(code)")
    .eq("is_active", true)
    .eq("item_type", "inventory")
    .gt("current_quantity", 0)
    .order("name")
    .limit(1000);

  return (data ?? []).map((item) => {
    const rack = Array.isArray(item.racks) ? item.racks[0] ?? null : item.racks;
    return { id: item.id, code: item.code, name: item.name, rackCode: rack?.code ?? "-", availableQuantity: item.current_quantity ?? 0 };
  });
}

export async function getLoans(params: LoanParams): Promise<LoanListRecord[]> {
  const supabase = await createClient();
  let query = supabase
    .from("loans")
    .select("id, code, borrower_name, borrower_phone, purpose, loaned_at, expected_return_on, status, closed_at, loan_items(quantity_borrowed, quantity_returned, quantity_damaged, quantity_lost)")
    .order("loaned_at", { ascending: false })
    .limit(100);

  const search = params.search?.trim().replace(/[,%()]/g, " ");
  if (search) query = query.or("code.ilike.%" + search + "%,borrower_name.ilike.%" + search + "%,borrower_phone.ilike.%" + search + "%,purpose.ilike.%" + search + "%");
  if (params.status === "active") query = query.eq("status", "active");
  if (params.status === "closed") query = query.eq("status", "closed");

  const { data } = await query;
  return (data ?? []).map((loan) => {
    const items = Array.isArray(loan.loan_items) ? loan.loan_items : [];
    const status = getLoanStatus(loan.status, loan.expected_return_on);
    const attentionStatus = getLoanAttentionStatus(loan.expected_return_on);
    if (params.status === "overdue" && status !== "overdue") return null;
    if (params.view === "attention" && !attentionStatus) return null;
    const outstandingQuantity = items.reduce((total, item) => total + item.quantity_borrowed - item.quantity_returned - item.quantity_damaged - item.quantity_lost, 0);
    return { id: loan.id, code: loan.code, borrowerName: loan.borrower_name, borrowerPhone: loan.borrower_phone, purpose: loan.purpose, loanedAt: loan.loaned_at, expectedReturnOn: loan.expected_return_on, closedAt: loan.closed_at, status, attentionStatus, itemCount: items.length, outstandingQuantity };
  }).filter((loan): loan is LoanListRecord => loan !== null);
}


export async function getOutstandingLoanItems(): Promise<OutstandingLoanItem[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("loan_items")
    .select("id, loan_id, quantity_borrowed, quantity_returned, quantity_damaged, quantity_lost, inventory_items(code, name, racks(code)), loans!inner(id, code, borrower_name, borrower_phone, purpose, expected_return_on, status)")
    .eq("loans.status", "active");

  return (data ?? []).map((item) => {
    const loan = Array.isArray(item.loans) ? item.loans[0] ?? null : item.loans;
    const inventoryItem = Array.isArray(item.inventory_items) ? item.inventory_items[0] ?? null : item.inventory_items;
    const rack = inventoryItem && (Array.isArray(inventoryItem.racks) ? inventoryItem.racks[0] ?? null : inventoryItem.racks);
    const outstandingQuantity = item.quantity_borrowed - item.quantity_returned - item.quantity_damaged - item.quantity_lost;
    if (!loan || !inventoryItem || outstandingQuantity <= 0) return null;
    return { id: item.id, loanId: loan.id, loanCode: loan.code, itemName: inventoryItem.name, itemCode: inventoryItem.code, rackCode: rack?.code ?? "-", outstandingQuantity, borrowerName: loan.borrower_name, borrowerPhone: loan.borrower_phone, purpose: loan.purpose, expectedReturnOn: loan.expected_return_on };
  }).filter((item): item is OutstandingLoanItem => item !== null);
}
export async function getLoanDetail(loanId: string): Promise<LoanDetail | null> {
  const supabase = await createClient();
  const { data: loan } = await supabase
    .from("loans")
    .select("id, code, borrower_name, borrower_phone, borrower_organization, purpose, loaned_at, expected_return_on, notes, documentation_path, status, closed_at, loan_items(id, quantity_borrowed, quantity_returned, quantity_damaged, quantity_lost, inventory_items(code, name, racks(code)), loan_item_returns(id, quantity_good, quantity_damaged, quantity_lost, notes, documentation_path, created_at))")
    .eq("id", loanId)
    .maybeSingle();

  if (!loan) return null;
  const items = Array.isArray(loan.loan_items) ? loan.loan_items : [];
  const detailItems = await Promise.all(items.map(async (item): Promise<LoanDetailItem | null> => {
    const inventoryItem = Array.isArray(item.inventory_items) ? item.inventory_items[0] ?? null : item.inventory_items;
    if (!inventoryItem) return null;
    const rack = Array.isArray(inventoryItem.racks) ? inventoryItem.racks[0] ?? null : inventoryItem.racks;
    const returns = Array.isArray(item.loan_item_returns) ? item.loan_item_returns : [];
    const returnRecords = await Promise.all(returns.map(async (entry): Promise<LoanReturnRecord> => ({
      id: entry.id,
      quantityGood: entry.quantity_good,
      quantityDamaged: entry.quantity_damaged,
      quantityLost: entry.quantity_lost,
      notes: entry.notes,
      documentationUrl: await getDocumentationUrl(entry.documentation_path),
      createdAt: entry.created_at,
    })));
    return { id: item.id, itemCode: inventoryItem.code, itemName: inventoryItem.name, rackCode: rack?.code ?? "-", quantityBorrowed: item.quantity_borrowed, quantityReturned: item.quantity_returned, quantityDamaged: item.quantity_damaged, quantityLost: item.quantity_lost, outstandingQuantity: item.quantity_borrowed - item.quantity_returned - item.quantity_damaged - item.quantity_lost, returns: returnRecords };
  }));

  return { id: loan.id, code: loan.code, borrowerName: loan.borrower_name, borrowerPhone: loan.borrower_phone, borrowerOrganization: loan.borrower_organization, purpose: loan.purpose, loanedAt: loan.loaned_at, expectedReturnOn: loan.expected_return_on, status: getLoanStatus(loan.status, loan.expected_return_on), attentionStatus: getLoanAttentionStatus(loan.expected_return_on), notes: loan.notes, documentationUrl: await getDocumentationUrl(loan.documentation_path), closedAt: loan.closed_at, items: detailItems.filter((item): item is LoanDetailItem => item !== null) };
}
