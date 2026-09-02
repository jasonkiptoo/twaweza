import type { Pagination } from "./api";

export type PaymentMethod = "Cash" | "Bank" | "Manual" | "Mpesa" | "Wallet";
export type LoanDecision = "approve" | "reject";
export type InterestType = "fixed" | "reducing_balance";
export type RepaymentFrequency = "weekly" | "biweekly" | "monthly";
export type ApprovalMode = "single" | "multi_level";
export type PaymentAllocationComponent =
  | "Penalty"
  | "Interest"
  | "Fee"
  | "Principal";

export interface CreditProduct {
  id: string;
  _id?: string;
  name: string;
  description?: string;
  group?: string;
  active?: boolean;
  minAmount?: number;
  maxAmount?: number;
  currency?: string;
  interestType?: InterestType;
  interestRate?: number;
  repaymentFrequency?: string;
  repaymentDurationMonths?: number;
  gracePeriodDays?: number;
  processingFee?: number;
  insuranceFee?: number;
  approvalMode?: string;
  maxActiveLoans?: number;
  paymentAllocationOrder?: PaymentAllocationComponent[];
  eligibilitySettings?: Record<string, unknown>;
}

export interface CreditLoanApplication {
  id: string;
  _id?: string;
  group?: string | CreditGroup;
  member?: string | CreditMember;
  product?: CreditProduct | string;
  productSnapshot?: CreditProduct;
  eligibilitySnapshot?: { eligible?: boolean; reasons?: string[] };
  requestedAmount?: number;
  repaymentDurationMonths?: number;
  repaymentFrequency?: string;
  purpose?: string;
  comments?: string;
  status?: string;
}

export interface CreditGroup {
  id?: string;
  _id?: string;
  name?: string;
  code?: string;
}

export interface CreditMember {
  id?: string;
  _id?: string;
  username?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
}

export interface CreditLoan {
  id: string;
  _id?: string;
  application?: string | CreditLoanApplication;
  member?: string | CreditMember;
  product?: string | CreditProduct;
  productSnapshot?: CreditProduct;
  applicationDetails?: CreditLoanApplication;
  principal?: number;
  interest?: number;
  principalAmount?: number;
  interestAmount?: number;
  fees?: number;
  totalAmount?: number;
  balance?: number;
  totalPaid?: number;
  amountRemaining?: number;
  status?: string;
  nextPaymentDate?: string;
  overdueDays?: number;
  approvedBy?: string;
  disbursedAt?: string;
}

export interface CreditLoanSchedule {
  id?: string;
  _id?: string;
  loan?: string;
  number: number;
  dueDate?: string;
  principal?: number;
  interest?: number;
  penalty?: number;
  amountDue?: number;
  amountPaid?: number;
  status?: string;
  paidAt?: string;
}

export interface CreditReconciliation {
  loanId: string;
  isReconciled: boolean;
  issues: string[];
  totals: {
    scheduleTotal: number;
    allocatedTotal: number;
    paymentTotal: number;
    paymentLedgerTotal: number;
    balance: number;
  };
}

export interface PaginatedCredit<T> {
  results: T[];
  pagination: Pagination;
}
