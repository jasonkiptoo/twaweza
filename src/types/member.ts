export interface Activity {
  id: string;
  _id?: string;
  type?: string;
  description?: string;
  amount?: number;
  createdAt?: string;
}

export interface Contribution {
  id: string;
  _id?: string;
  amount?: number;
  month?: number | string;
  year?: number;
  status?: string;
  paymentMethod?: string;
  method?: string;
  phone?: string;
  reference?: string;
  createdAt?: string;
}

export interface UserSummary {
  assets?: number;
  liabilities?: number;
  net_position?: number;
  user_contribution?: number;
  user_total_repaid?: number;
  user_loan_limit?: number;
  user_loans_issued?: number;
  user_loans_balance?: number;
}

export interface GroupDetails {
  id: string;
  _id?: string;
  name?: string;
  code?: string;
  description?: string;
  status?: string;
  totalSavings?: number;
  monthlyTarget?: number;
  groupContribution?: number;
  location?: { city?: string; country?: string };
  members?: Array<{
    _id?: string;
    id?: string;
    first_name?: string;
    last_name?: string;
    username?: string;
    profile_image?: string;
    role?: string;
  }>;
  banks?: Array<{
    name?: string;
    accountName?: string;
    accountNumber?: string;
    branch?: string;
  }>;
}
