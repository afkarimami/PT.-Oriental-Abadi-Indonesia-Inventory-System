export type StockMovementReport = {
  id: string;
  itemName: string;
  itemCode: string;
  rackCode: string;
  quantity: number;
  quantityBefore: number;
  quantityAfter: number;
  notes: string | null;
  createdAt: string;
};

export type LoanActivityReport = {
  id: string;
  itemName: string;
  itemCode: string;
  quantity: number;
  borrowerName: string;
  loanedAt: string;
};