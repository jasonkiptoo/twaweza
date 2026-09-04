# 📊 Dashboard Redesign - Complete Specification

## 1. DASHBOARD LAYOUT DESIGN

### **High-Level Structure**

```
┌─────────────────────────────────────────┐
│ HEADER                                  │
│ ┌─────────────────────────────────────┐ │
│ │ Hi, Guru 👋 | 🔔 Notifications     │ │
│ └─────────────────────────────────────┘ │
├─────────────────────────────────────────┤
│ PRIMARY CARD - Savings Summary          │
│ ┌─────────────────────────────────────┐ │
│ │ Total Group Savings    KES 450,000  │ │
│ │ Monthly Target:        KES 50,000   │ │
│ │ Progress: ███████░░░░ 75%           │ │
│ │ [Your Contribution: KES 15,000]     │ │
│ │ [💰 Show Balance]                   │ │
│ └─────────────────────────────────────┘ │
├─────────────────────────────────────────┤
│ QUICK ACTIONS                           │
│ ┌──────────────┬──────────────┐         │
│ │ 💳 Deposit   │ 💰 Request   │         │
│ │              │   Loan       │         │
│ └──────────────┴──────────────┘         │
│ ┌──────────────────────────────┐         │
│ │ 📋 Repay Loan                 │        │
│ └──────────────────────────────┘         │
├─────────────────────────────────────────┤
│ DASHBOARD SECTIONS                      │
│ ┌─────────────────────────────────────┐ │
│ │ 📈 Financial Overview               │ │
│ │ • Total Savings: KES 15,000        │ │
│ │ • Pending Contributions: KES 2,000 │ │
│ │ • Active Loans: 1                  │ │
│ │ • Due for Repayment: KES 3,500     │ │
│ └─────────────────────────────────────┘ │
│ ┌─────────────────────────────────────┐ │
│ │ 📝 Recent Activities                │ │
│ │ • You approved John's contribution │ │
│ │ • Sarah received loan approval     │ │
│ │ • Monthly target reached! 🎉      │ │
│ │ [View All Activities →]            │ │
│ └─────────────────────────────────────┘ │
│ ┌─────────────────────────────────────┐ │
│ │ 📊 My Contributions                 │ │
│ │ • September 2024: KES 5,000 ✓      │ │
│ │ • August 2024: KES 5,000 ✓         │ │
│ │ • July 2024: KES 5,000 ✓           │ │
│ │ [View Full History →]               │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

---

## 2. DATA REQUIREMENTS & CALCULATIONS

### **Calculations Needed**

```
totalSavings = all members' approved contributions
monthlyTarget = from Group model
progressPercent = (totalSavings / monthlyTarget) * 100
userContribution = sum of user's approved contributions
pendingAmount = sum of user's pending contributions
```

### **Dashboard Stats** (must calculate)

```typescript
interface DashboardStats {
  totalSavings: number; // Sum of all approved contributions
  monthlyTarget: number; // Group monthly target
  progressPercent: number; // (totalSavings / monthlyTarget) * 100
  userTotalContribution: number; // User's approved contributions sum
  userPendingAmount: number; // User's pending contributions
  activeLoans: number; // Count of active loans
  loansDueForRepayment: number; // Sum of loans requiring payment
  contributionStatus: "ontrack" | "behind" | "ahead";
}
```

---

## 3. API ENDPOINTS REQUIRED

### **Dashboard Data Endpoints**

#### A. Get Group Savings Summary

```
GET /api/v1/groups/{groupId}
Authentication: Bearer {token}

Response:
{
  "_id": "group123",
  "name": "Mama Mwaliko Group",
  "totalSavings": 450000,      // (calculated or stored)
  "monthlyTarget": 50000,
  "members": [...],
  "createdAt": "2024-01-15"
}
```

#### B. Get User Summary/Stats

```
GET /api/v1/users/summary
Authentication: Bearer {token}

Response:
{
  "userId": "user123",
  "groupId": "group123",
  "userContributions": {
    "total": 15000,
    "pending": 2000,
    "approved": 13000
  },
  "loans": {
    "active": 1,
    "totalActive": 25000,
    "dueForRepayment": 3500
  },
  "contributionStatus": "ontrack"
}
```

#### C. Get Contributions (User)

```
GET /api/v1/contributions/my-contributions?page=1&pageSize=5
Authentication: Bearer {token}

Response:
{
  "results": [
    {
      "id": "contrib123",
      "amount": 5000,
      "month": 9,
      "year": 2024,
      "status": "approved",
      "method": "Mpesa",
      "reference": "TXN123456",
      "createdAt": "2024-09-01T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 5,
    "totalElements": 12,
    "totalPages": 3
  }
}
```

#### D. Get Recent Activities (Group)

```
GET /api/v1/activities?limit=10
Authentication: Bearer {token}

Response:
{
  "activities": [
    {
      "id": "act123",
      "type": "contribution_approved",
      "actor": "admin",
      "member": "John Doe",
      "description": "Approved contribution of KES 5,000",
      "timestamp": "2024-09-04T14:20:00Z",
      "relatedId": "contrib123"
    }
  ]
}
```

#### E. Get Active Loans (User)

```
GET /api/v1/credit-management/loans?status=active
Authentication: Bearer {token}

Response:
{
  "results": [
    {
      "id": "loan123",
      "amount": 50000,
      "status": "active",
      "nextPaymentDue": "2024-09-15",
      "amountDue": 3500,
      "product": {
        "name": "Emergency Loan",
        "interestRate": 5
      }
    }
  ]
}
```

---

## 4. CONTRIBUTION MODAL SPECIFICATION

### **Modal A: Add Contribution (Deposit)**

#### **UI Layout**

```
┌─────────────────────────────────────┐
│ 💳 Add Contribution                 │
├─────────────────────────────────────┤
│                                     │
│ 📌 AMOUNT (Required)                │
│ [                          ] KES    │
│ ⚠️  Must be greater than 0          │
│                                     │
│ 📌 PAYMENT METHOD (Required)        │
│ ┌──────────┬──────────┬─────────┐  │
│ │ 📱 M-Pesa│ 🏦 Bank  │ 💰 Cash │  │
│ └──────────┴──────────┴─────────┘  │
│                                     │
│ 📌 PHONE (Required for M-Pesa)      │
│ [07                            ]    │
│                                     │
│ 📌 REFERENCE (Optional)             │
│ [                          ]        │
│ Example: TXN123456, INV-2024-001   │
│                                     │
│ ⚠️  [Error message if any]          │
│ ✓  [Success message if any]         │
│                                     │
│ ┌──────────────┬──────────────────┐ │
│ │   Cancel     │ Submit Contribution
│ └──────────────┴──────────────────┘ │
│                    [Loading...]     │
└─────────────────────────────────────┘
```

#### **Field Specifications**

| Field          | Type   | Required | Validation                  | Notes                          |
| -------------- | ------ | -------- | --------------------------- | ------------------------------ |
| Amount         | Number | ✓        | > 0, numeric only           | Placeholder: "KES amount"      |
| Payment Method | Select | ✓        | "Mpesa" \| "Bank" \| "cash" | Buttons/Tabs to select         |
| Phone          | Text   | ✓*       | Phone format                | *Only if method = "Mpesa"      |
| Reference      | Text   | ✗        | Alphanumeric                | Optional transaction reference |

#### **Conditional Logic**

- If `method === "Mpesa"`: Show phone field (Required)
- If `method === "Bank"`: Hide phone field, optionally show account info
- If `method === "cash"`: Hide phone field, show "Confirm with admin" note
- Amount must be number, no decimals

#### **Validation Messages**

```
❌ "Enter a contribution amount greater than zero."
❌ "Enter a phone number for M-Pesa."
❌ "Invalid phone number format."
❌ "Unable to submit contribution."
✓  "Contribution submitted successfully."
```

#### **Submit Behavior**

```typescript
async function submit() {
  // 1. Validate all fields
  // 2. Show loading state (disable button, show spinner)
  // 3. Call API: POST /contributions/add
  // 4. Show success message
  // 5. Clear form
  // 6. Auto-close after 700ms
  // 7. On error: Show error message, keep modal open
}
```

---

### **Modal B: Edit Contribution (Admin)**

#### **UI Layout**

```
┌─────────────────────────────────────┐
│ ✏️  Edit Contribution                │
├─────────────────────────────────────┤
│ Contributor: John Doe               │
│ Original Amount: KES 5,000 (Locked) │
│                                     │
│ 📌 STATUS (Required)                │
│ ┌──────────┬──────────────────────┐ │
│ │ ✓ Approve│ ✗ Reject            │ │
│ └──────────┴──────────────────────┘ │
│                                     │
│ 📌 NOTES (Optional)                 │
│ [                                 ] │
│ [                                 ] │
│ Help text: Why rejecting? etc       │
│                                     │
│ ⚠️  [Error message if any]          │
│                                     │
│ ┌──────────────┬──────────────────┐ │
│ │   Cancel     │ Submit           │ │
│ └──────────────┴──────────────────┘ │
└─────────────────────────────────────┘
```

#### **Approve/Reject API**

```
PUT /api/v1/admin/contributions/{contributionId}
Authorization: Bearer {token}

Request:
{
  "decision": "approve" | "reject",
  "notes": "Optional admin notes"
}

Response:
{
  "success": true,
  "message": "Contribution approved successfully",
  "contribution": {...}
}
```

---

## 5. STATE MANAGEMENT HOOKS

### **Dashboard Store** (New/Enhanced)

```typescript
interface DashboardState {
  // Data
  stats: DashboardStats | null;
  group: Group | null;
  activities: Activity[];
  contributions: Contribution[];
  loans: CreditLoan[];

  // Loading states
  statsLoading: boolean;
  activitiesLoading: boolean;
  error?: string;

  // Methods
  fetchDashboardStats: (token: string) => Promise<void>;
  fetchActivities: (token: string, limit?: number) => Promise<void>;
  refreshAll: (token: string) => Promise<void>;

  // Pagination
  hasMoreActivities: boolean;
  fetchMoreActivities: (token: string, page: number) => Promise<void>;
}

// Usage in component
const stats = useDashboardStore((state) => state.stats);
const fetchAll = useDashboardStore((state) => state.refreshAll);
```

---

## 6. COMPONENT HIERARCHY

```
Dashboard Screen
├── Header (Greeting + Notifications)
├── Savings Summary Card
│   ├── Total Amount Display
│   ├── Progress Bar
│   ├── Monthly Target
│   └── Show/Hide Balance Toggle
├── Quick Actions
│   ├── Deposit Button → Opens Modal A
│   ├── Request Loan Button
│   └── Repay Loan Button
├── Financial Overview Section
│   ├── Stats Cards (Total, Pending, Loans, Due)
│   └── "Learn More" Links
├── Recent Activities Section
│   ├── Activity List
│   ├── Pagination (Load More)
│   └── View All Link
├── My Contributions Section
│   ├── Contribution List
│   ├── Pagination
│   └── View Full History Link
└── Modals
    ├── DepositModal (Modal A)
    └── EditContributionModal (Modal B - Admin)
```

---

## 7. API RESPONSE CACHING STRATEGY

```
Dashboard Data Refresh:
- On screen load: Fetch all data
- Pull-to-refresh: Invalidate all cache, fetch fresh
- Background refresh: Every 5 minutes (optional)

Caching durations:
- Stats: 5 minutes
- Activities: 3 minutes
- Contributions: 10 minutes
- Group info: 30 minutes

Error handling:
- Network error: Show cached data + offline indicator
- 401 Unauthorized: Redirect to login
- 404 Not found: Show empty state
```

---

## 8. IMPLEMENTATION PRIORITY

### **Phase 1: Core Dashboard** (Required)

- [ ] Fetch & display group savings
- [ ] Show user contribution summary
- [ ] Display financial overview stats
- [ ] Quick action buttons
- [ ] Implement deposit modal

### **Phase 2: Activities & History** (Important)

- [ ] Recent activities feed
- [ ] My contributions list
- [ ] Pagination/infinite scroll
- [ ] Activity filtering

### **Phase 3: Admin Features** (Nice-to-have)

- [ ] Edit contribution modal
- [ ] Approve/reject contributions
- [ ] Admin stats dashboard
- [ ] Audit logs

---

## 9. MOBILE-FIRST DESIGN NOTES

- Use card-based layout for vertical scrolling
- Single column for phones, 2-3 columns for tablets
- Swipe-to-reveal actions (approve/reject)
- Bottom sheet modals instead of center dialogs
- Large touch targets (48px minimum)
- Pull-to-refresh gesture support
- Infinite scroll for lists (not pagination buttons)

---

## 10. CONTRIBUTION MODAL - COMPLETE FORM STATE

```typescript
interface ContributionFormState {
  amount: string; // User input as string
  method: "Mpesa" | "Bank" | "cash";
  phone: string; // Only validated if method = "Mpesa"
  reference: string; // Optional
}

interface ModalState {
  open: boolean;
  loading: boolean; // During API call
  error: string; // Error message to display
  success: string; // Success message to display
  formDirty: boolean; // User has made changes
}
```
