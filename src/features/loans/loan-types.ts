export type LoanStatus = "active" | "closed" | "overdue";
export type LoanView = "active" | "returns" | "history" | "attention";
export type LoanAttentionStatus = "overdue" | "due_soon";

export type LoanParams = {
  search?: string;
  status?: LoanStatus;
  view?: LoanView;
};

export type LoanableItem = {
  id: string;
  code: string;
  name: string;
  rackCode: string;
  availableQuantity: number;
};

export type LoanListRecord = {
  id: string;
  code: string;
  borrowerName: string;
  borrowerPhone: string;
  purpose: string;
  loanedAt: string;
  expectedReturnOn: string | null;
  closedAt: string | null;
  status: LoanStatus;
  attentionStatus: LoanAttentionStatus | null;
  itemCount: number;
  outstandingQuantity: number;
};

export type OutstandingLoanItem = {
  id: string;
  loanId: string;
  loanCode: string;
  itemName: string;
  itemCode: string;
  rackCode: string;
  outstandingQuantity: number;
  borrowerName: string;
  borrowerPhone: string;
  purpose: string;
  expectedReturnOn: string | null;
};

export type LoanReturnRecord = {
  id: string;
  quantityGood: number;
  quantityDamaged: number;
  quantityLost: number;
  notes: string | null;
  documentationUrl: string | null;
  createdAt: string;
};

export type LoanDetailItem = {
  id: string;
  itemCode: string;
  itemName: string;
  rackCode: string;
  quantityBorrowed: number;
  quantityReturned: number;
  quantityDamaged: number;
  quantityLost: number;
  outstandingQuantity: number;
  returns: LoanReturnRecord[];
};

export type LoanDetail = Omit<LoanListRecord, "itemCount" | "outstandingQuantity"> & {
  borrowerOrganization: string | null;
  notes: string | null;
  documentationUrl: string | null;
  items: LoanDetailItem[];
};