# App Structure Redesign - Proper Organization

## ❌ PROBLEM WITH CURRENT APPROACH

I referenced API routes that **don't exist**:
- ❌ `/credit-management/group/financial-summary` 
- ❌ `/api/v1/dashboard/summary`
- ❌ `/credit-management/contributions/mine`
- ❌ `/credit-management/contributions/settings`

The ACTUAL routes available are:
- ✅ `/contributions/my-contributions` (legacy)
- ✅ `/credit-management/loans` (existing)
- ✅ `/credit-management/products` (existing)
- ✅ `/credit-management/applications` (existing)
- ✅ `/activity/get-group-activity` (existing)
- ✅ `/auth/user-summary` (existing)

---

## ✅ PROPER APP STRUCTURE (Using Actual Routes)

### **Route Organization**

```
src/app/
├── (tabs)/
│   ├── _layout.tsx
│   ├── dashboard.tsx              # Home: Quick overview
│   ├── contributions.tsx           # NEW: Contributions history + streak
│   ├── loans.tsx                   # NEW: Loan overview & balance
│   ├── group.tsx                   # Group members
│   ├── profile.tsx                 # User profile
│   └── credit-management/
│       ├── _layout.tsx
│       ├── index.tsx               # Loan products listing
│       ├── products.tsx            # Create loan application
│       └── [loanId]/
│           └── details.tsx         # View specific loan + schedule
│
├── (auth)/
│   ├── login.tsx
│   ├── signup.tsx
│   └── otp.tsx
│
├── admin/
│   ├── _layout.tsx                 # Admin workspace layout
│   ├── index.tsx                   # Admin dashboard
│   ├── contributions/
│   │   ├── _layout.tsx
│   │   ├── index.tsx               # Pending contributions
│   │   └── settings.tsx            # Contribution policy (NEW)
│   ├── loans/
│   │   ├── _layout.tsx
│   │   ├── index.tsx               # Loan products management
│   │   └── [productId]/
│   │       └── edit.tsx
│   └── group/
│       ├── settings.tsx            # Group settings (NEW)
│       └── members.tsx
```

---

## 📱 **USER EXPERIENCE FLOW**

### **Regular Member Journey**

```
Dashboard (Home)
├── Quick Stats: My balance, loans, contributions
├── Action Button: "Add Contribution" → Contributions Tab
├── Action Button: "Request Loan" → Credit Management → Products
└── Action Button: "Pay Loan" → Credit Management → Loans

Contributions Tab
├── Contribution History (all time)
├── Contribution Streak (visual indicator)
├── Status for each: Pending/Approved/Rejected
├── Filter: This month, This week, All time
└── Stats: Total contributed, Pending amount

Loans Tab (Credit)
├── All My Loans (active + inactive)
├── For each loan:
│   ├── Loan Amount
│   ├── Status: Approved/Pending/Disbursed/Repaid
│   ├── Current Balance (remaining)
│   ├── Next Payment Due
│   └── Payment Schedule (expandable)
├── Quick Action: "Make Payment"
└── Request New Loan button

Group Page (unchanged)
Profile Page (unchanged)
```

### **Admin Journey**

```
Admin Workspace (formal dashboard)
├── Quick Stats
│   ├── Pending contributions count
│   ├── Pending loan applications
│   └── Group financial summary

Admin > Contributions
├── Settings Tab
│   ├── Enable/Disable contributions
│   ├── Minimum contribution amount
│   ├── Required contribution frequency
│   ├── Approval required? (toggle)
│   ├── Allowed methods: M-Pesa, Bank, Cash
│   └── Save button
│
└── Approvals Tab
    ├── List of pending contributions
    ├── Member info
    ├── Amount & date
    ├── Action buttons: Approve / Reject
    └── Confirmation dialog

Admin > Loans
├── Products Tab
│   ├── List all loan products
│   ├── Create new product button
│   └── For each product:
│       ├── Loan amount range
│       ├── Interest rate
│       ├── Duration
│       ├── Edit button
│       └── Delete button
│
├── Pending Applications Tab
│   ├── Loan applications awaiting approval
│   ├── Member info
│   ├── Requested amount
│   ├── Purpose
│   └── Action buttons: Approve / Reject
│
└── Active Loans Tab
    ├── All active loans in group
    ├── Member borrowing total
    ├── Status
    └── Collection status

Admin > Group Settings (NEW)
├── Basic Settings
│   ├── Group name
│   ├── Group description
│   └── Contact info
│
├── Contribution Settings
│   ├── (Redirects to Admin > Contributions > Settings)
│
├── Loan Settings
│   ├── Default interest rate
│   ├── Min/Max loan amount
│   ├── Min/Max duration
│   └── Approval required?
│
└── Member Management
    ├── List all members
    ├── Remove member
    └── Promote to admin
```

---

## 📊 **Dashboard - Revised (Using Existing APIs)**

```typescript
// What to show (from existing endpoints)

// From /auth/user-summary
- userContributions: { total, approved, pending }
- loans: { active, totalActive, dueForRepayment }

// From /credit-management/loans
- List of active loans
- Next payment due

// From /contributions/my-contributions
- Recent contributions
- Status of each

// From /activity/get-group-activity
- Recent group activity

// Visual hierarchy:
1. Header: Greeting + Group name
2. Quick Stats (3 cards):
   - My Contributions: approved amount + pending count
   - Active Loans: count + total borrowed
   - Group Balance: (calculated from group data)
3. Quick Actions (buttons):
   - Add Contribution
   - Request Loan
   - Pay Loan
   - Admin (if user is admin)
4. Recent Contributions (last 3)
5. Recent Activity Feed
```

---

## 🏗️ **Component Structure**

### **Tabs Layout**
- Dashboard (Overview)
- Contributions (History + Streak)
- Loans (Credit Management - renamed for clarity)
- Group (Members)
- Profile (Account)

### **Admin Workspace** (`/admin`)
- Separate formal layout
- Sidebar or tab navigation
- Three main sections:
  1. **Contributions**: Settings + Approvals
  2. **Loans**: Products + Applications + Active Loans
  3. **Group**: Settings + Members

---

## 📋 **API Routes to Use (ACTUAL)**

### **User Data**
```
GET /auth/user-summary                    # User financial summary
GET /auth/me                              # Current user profile
```

### **Contributions**
```
GET /contributions/my-contributions        # User's contributions history
POST /contributions/add                    # Submit new contribution
GET /admin/contributions                   # Admin: all contributions
PUT /admin/contributions/approve/:id       # Admin: approve
PUT /admin/contributions/reject/:id        # Admin: reject
```

### **Loans**
```
GET /credit-management/loans               # User's loans (with filters)
GET /credit-management/loans/:id           # Specific loan details
GET /credit-management/loans/:id/schedule  # Payment schedule
POST /credit-management/loans/:id/payments # Make payment
GET /credit-management/products            # Loan products
POST /credit-management/products           # Create product (admin)
GET /credit-management/applications        # Loan applications
POST /credit-management/applications       # Submit application
```

### **Activity**
```
GET /activity/get-group-activity           # Group activity feed
```

---

## 🎯 **TODO - Proper Implementation**

### **Phase 1: Fix Dashboard (Using Actual Routes)**
1. Update `dashboardApi.ts` to use REAL routes
2. Fetch from: `/auth/user-summary`, `/contributions/my-contributions`, `/credit-management/loans`
3. Remove fake routes

### **Phase 2: Create Contributions Tab**
- File: `src/app/(tabs)/contributions.tsx`
- Show all contributions with status
- Track streak (consecutive months with contribution)
- Filter by date range
- Use: `/contributions/my-contributions`

### **Phase 3: Create Loans Tab**
- File: `src/app/(tabs)/loans.tsx`
- Rename "credit-management" to "loans" for clarity
- Show all user loans
- Display: Amount, Status, Balance, Next Payment
- Link to payment flow
- Use: `/credit-management/loans`

### **Phase 4: Create Admin Workspace**
```
src/app/admin/
├── _layout.tsx                  # Admin workspace layout
├── index.tsx                    # Admin dashboard
├── contributions/
│   ├── settings.tsx             # Contribution policy editor
│   └── approvals.tsx            # Pending approvals
├── loans/
│   ├── products.tsx             # Manage loan products
│   ├── applications.tsx         # Pending applications
│   └── active.tsx               # Active loans
└── group/
    └── settings.tsx             # Group settings
```

### **Phase 5: Group Settings** (NEW)
- File: `src/app/admin/group/settings.tsx`
- Separate from Contribution settings
- Basic info + member management

---

## 🔄 **Data Flow**

### **Contributions**
```
Store: useContributionStore
├── fetch(token) → GET /contributions/my-contributions
├── add(token, payload) → POST /contributions/add
├── getAll(token) → GET /contributions/my-contributions (paginated)
└── calculateStreak() → Count consecutive months
```

### **Loans**
```
Store: useLoanStore (or useCreditManagementStore)
├── listLoans(token) → GET /credit-management/loans
├── getLoanDetails(token, id) → GET /credit-management/loans/:id
├── getSchedule(token, id) → GET /credit-management/loans/:id/schedule
├── makePayment(token, id, amount) → POST /credit-management/loans/:id/payments
└── requestLoan(token, payload) → POST /credit-management/applications
```

### **Admin**
```
Contributions:
  GET /admin/contributions → Pending list
  PUT /admin/contributions/approve/:id → Approve
  PUT /admin/contributions/reject/:id → Reject

Loans:
  GET /credit-management/products → Loan products
  POST /credit-management/products → Create product
  GET /credit-management/applications → Pending applications
  POST /credit-management/applications (approval) → Approve application
```

---

## ✨ **Key Improvements**

✅ **Uses ACTUAL API routes** (no made-up endpoints)
✅ **Clear separation of concerns** (tabs, admin workspace)
✅ **Proper navigation structure** (formal admin area)
✅ **Member-focused UX** (clear tabs: contributions, loans)
✅ **Admin-friendly tools** (organized admin workspace)
✅ **Streak tracking** (gamification for contributions)
✅ **Loan visibility** (status, balance, schedule in one place)
✅ **Settings isolated** (group settings ≠ contribution settings)

---

## 📝 **NEXT STEPS**

1. **Verify these routes actually exist** on your backend
2. **Get exact response formats** for each endpoint
3. **Start with Phase 1**: Fix dashboard with real routes
4. **Incrementally build** contributions tab, loans tab, admin workspace

Need me to start with Phase 1? Just confirm which routes exist on your backend.
