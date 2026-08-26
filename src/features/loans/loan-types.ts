export type LoanView = "active" | "returns" | "attention" | "history";

export type LoanParams = {
  view?: LoanView;
};

export type LoanListRecord = any;
export type LoanableItem = any;
export type OutstandingLoanItem = any;
export type LoanDetailRecord = any; 
export type LoanRecord = LoanDetailRecord;
export type LoanItemDetail = any;