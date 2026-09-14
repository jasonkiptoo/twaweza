export type PaymentMethod = "Cash" | "Bank" | "Manual" | "Mpesa" | "Wallet";
export type LoanDecision = "approve" | "reject";
export type InterestType = "fixed" | "reducing_balance";
export type RepaymentFrequency = "weekly" | "biweekly" | "monthly";
export type ApprovalMode = "single" | "multi_level";
export type PaymentAllocationComponent =
  "Penalty" | "Interest" | "Fee" | "Principal";

export interface CreditProduct {
  id: string;
  _id?: string;
  name: string;
  description?: string;
  minAmount?: number;
  maxAmount?: number;
  currency?: string;
  interestType?: InterestType;
  interestRate?: number;
  repaymentFrequency?: string;
  repaymentDurationMonths?: number;
  active?: boolean;
  // ✅ Admin-only fields (now available when editing)
  gracePeriodDays?: number;
  processingFee?: number;
  insuranceFee?: number;
  approvalMode?: ApprovalMode;
  maxActiveLoans?: number;
  paymentAllocationOrder?: PaymentAllocationComponent[];
  penaltyRules?: {
    type?: string;
    value?: number;
    graceDays?: number;
  };
  eligibilitySettings?: {
    minimumMembershipDurationDays?: number;
    requireActiveMember?: boolean;
    maxActiveLoans?: number;
    allowBorrowingWhileAnotherProductExists?: boolean;
    minimumAgeInGroup?: number;
    requirePreviousLoanCleared?: boolean;
  };
}

export interface CreditLoanApplication {
  id: string;
  _id?: string;
  group?: string | CreditGroup;
  member?: string | CreditMember;
  product?: CreditProduct | string;
  productSnapshot?: CreditProduct;
  requestedAmount?: number;
  repaymentDurationMonths?: number;
  repaymentFrequency?: string;
  purpose?: string;
  comments?: string;
  status?: string;
  // Note: eligibilitySnapshot and applicationDetails excluded from list responses
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
  productSnapshot?: CreditProduct;
  principal?: number;
  interest?: number;
  principalAmount?: number;
  interestAmount?: number;
  fees?: number;
  balance?: number;
  totalPaid?: number;
  amountRemaining?: number;
  status?: string;
  nextPaymentDate?: string;
  overdueDays?: number;
  // Note: application, member, product (fallback), totalAmount, approvedBy, disbursedAt,
  // applicationDetails excluded from list responses
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
  pagination: {
    page: number;
    pageSize: number;
    totalPages: number;
    totalElements: number;
  };
}

// ======== CONTRIBUTION TYPES (NEW API CONTRACT) ========

export type ContributionMethod = "Mpesa" | "Bank" | "cash";
export type ContributionStatus =
  "pending" | "confirmed" | "failed" | "rejected";
export type ContributionFrequency = "none" | "weekly" | "monthly";

export interface Contribution {
  id: string;
  amount: number;
  currency: string;
  method: ContributionMethod;
  reference?: string;
  status: ContributionStatus;
  contributionType?: string;
  contributionTypeName?: string;
  contributedAt: string;
  confirmedAt?: string;
}

export interface GroupContribution extends Contribution {
  member: {
    id: string;
    name: string;
    phone?: string;
    memberNumber?: string;
  };
}

export interface ContributionSettings {
  enabled: boolean;
  required: boolean;
  minimumAmount: number;
  minimumFrequency: ContributionFrequency;
  minimumPeriods: number;
  minimumConfirmedAmount: number;
  eligibilityPercentage: number;
  loanMultiplier: number;
  allowPendingForEligibility: boolean;
  approvalRequired: boolean;
  allowedMethods: ContributionMethod[];
  currency: string;
}

export interface CreateContributionRequest {
  amount: number;
  method: ContributionMethod;
  reference?: string;
  idempotencyKey?: string;
  contributionType?: string;
}

export interface ContributionType {
  id: string;
  name: string;
  description?: string;
  amount: number;
  currency: string;
  frequency: ContributionFrequency;
  active: boolean;
  dueDay?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ContributionListResponse<T extends Contribution> {
  results: T[];
  pagination: PaginatedCredit<T>["pagination"]["totalPages"] extends number
    ? {
        page: number;
        pageSize: number;
        total: number;
        totalPages: number;
      }
    : never;
}

// ======== DASHBOARD TYPES ========

export interface GroupFinancialSummary {
  group: {
    id: string;
    name: string;
    currency: string;
  };
  contributions: {
    confirmedTotal: number;
    pendingTotal: number;
    memberCount: number;
  };
  loans: {
    totalDisbursed: number;
    outstandingPrincipal: number;
    repaidPrincipal: number;
    activeLoans: number;
    pendingApplications: number;
  };
  financialPosition: {
    totalContributions: number;
    outstandingLoanPrincipal: number;
    availableGroupFunds: number;
  };
  contributionPolicy: Pick<
    ContributionSettings,
    | "enabled"
    | "required"
    | "minimumAmount"
    | "minimumFrequency"
    | "minimumPeriods"
    | "currency"
  >;
  updatedAt: string;
}

export interface ContributionProgressSnapshot {
  required: boolean;
  confirmedTotal: number;
  qualifyingPeriods: number;
  maximumEligibleAmount: number;
  evaluatedAt: string;
}

export interface LoanEligibilityResponse {
  eligible: boolean;
  reasons?: string[];
  application?: {
    _id: string;
    status: string;
    requestedAmount: number;
    contributionEligibilitySnapshot: ContributionProgressSnapshot;
  };
}

export interface DashboardSummary {
  user: {
    id: string;
    name: string;
    timezone?: string;
  };
  group: {
    id: string;
    name: string;
    currency: string;
  };
  financialPosition: {
    availableGroupFunds: number;
    totalContributions: number;
    outstandingLoanPrincipal: number;
  };
  myContribution: {
    confirmedTotal: number;
    pendingTotal: number;
    thisMonth?: number;
    thisWeek?: number;
  };
  myLoans: {
    active: number;
    totalActive: number;
    nextRepaymentAmount?: number;
    nextRepaymentDate?: string;
  };
  contributions: {
    frequency: ContributionFrequency;
    amount: number;
    progress?: number; // percentage
    periods?: {
      required: number;
      completed: number;
    };
  };
  admin?: {
    pendingContributions: number;
    pendingApplications: number;
  };
  updatedAt: string;
}
