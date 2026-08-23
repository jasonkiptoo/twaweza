import type { Pagination } from "./api";

export type PaymentMethod = "Cash" | "Bank" | "Manual" | "Mpesa" | "Wallet";
export type LoanDecision = "approve" | "reject";

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
  interestType?: string;
  interestRate?: number;
  repaymentFrequency?: string;
  repaymentDurationMonths?: number;
  gracePeriodDays?: number;
  processingFee?: number;
  insuranceFee?: number;
  approvalMode?: string;
  maxActiveLoans?: number;
  eligibilitySettings?: Record<string, unknown>;
}

export interface CreditLoanApplication {
  id: string;
  _id?: string;
  group?: string;
  product?: CreditProduct | string;
  requestedAmount?: number;
  purpose?: string;
  comments?: string;
  status?: string;
}

export interface CreditLoan {
  id: string;
  _id?: string;
  application?: string | CreditLoanApplication;
  member?: string;
  product?: string | CreditProduct;
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

export interface PaginatedCredit<T> {
  results: T[];
  pagination: Pagination;
}
