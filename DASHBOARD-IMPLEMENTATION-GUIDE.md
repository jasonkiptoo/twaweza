# 🎨 Dashboard Redesign - Quick Reference & Code Examples

## CURRENT vs NEW COMPARISON

### Current Dashboard

- ✅ Shows group savings + user profile
- ✅ Has quick action buttons
- ✅ Shows last 5 activities
- ❌ Limited financial overview
- ❌ No contribution history visible
- ❌ No loan status display

### New Dashboard (Enhanced)

- ✅ Better organized sections
- ✅ Financial overview cards
- ✅ Contribution status tracking
- ✅ Loan management status
- ✅ Activity feed with pagination
- ✅ Progress towards targets
- ✅ Admin contribution approval queue

---

## API REQUIREMENTS SUMMARY

### **Minimum APIs Needed**

```typescript
// 1. Group info (already exists)
GET / api / v1 / groups / { groupId };

// 2. User summary (NEW - may need to create)
GET / api / v1 / users / summary;

// 3. Contributions (already exists)
GET / api / v1 / contributions / my - contributions;

// 4. Activities (already exists)
GET / api / v1 / activities;

// 5. User Loans (already exists)
GET / api / v1 / credit - management / loans;
```

### **New Backend Endpoints to Create** (If missing)

#### User Summary Endpoint

```javascript
// routes/userRoutes.js
router.get("/summary", verifyUser, getUserSummary);

// controllers/userController.js
const getUserSummary = asyncWrapper(async (req, res) => {
  const userId = res.locals.user.id;
  const user = await User.findById(userId).populate("group");

  // Get contribution stats
  const contributions = await Contribution.find({
    contributor: userId,
    group: user.group._id,
  });

  const approved = contributions
    .filter((c) => c.status === "approved")
    .reduce((sum, c) => sum + (c.amount || 0), 0);

  const pending = contributions
    .filter((c) => c.status === "pending")
    .reduce((sum, c) => sum + (c.amount || 0), 0);

  // Get loan stats
  const loans = await Loan.find({
    borrower: userId,
    status: { $in: ["active", "pending"] },
  });

  const dueForRepayment = loans
    .filter((l) => l.nextPaymentDue < new Date())
    .reduce((sum, l) => sum + (l.amountDue || 0), 0);

  return res.status(200).json({
    userId,
    groupId: user.group._id,
    userContributions: {
      total: approved + pending,
      approved,
      pending,
    },
    loans: {
      active: loans.filter((l) => l.status === "active").length,
      totalActive: loans.reduce((sum, l) => sum + (l.amount || 0), 0),
      dueForRepayment,
    },
    contributionStatus:
      approved >= (user.group.monthlyTarget || 0) ? "ahead" : "ontrack",
  });
});
```

---

## CONTRIBUTION MODAL - IMPLEMENTATION EXAMPLE

### Complete Modal Component

```typescript
// components/DashboardModals/AddContributionModal.tsx
import { useState } from "react";
import { View, ScrollView } from "react-native";
import { AppDialog } from "@/components/ui/dialog";
import { VStack } from "@/components/ui/vstack";
import { FormField } from "@/components/ui/FormField";
import { AppInput } from "@/components/ui/AppInput";
import { AppButton } from "@/components/ui/AppButton";
import { Text } from "@/components/ui/text";
import { useTheme } from "@/hooks/useTheme";
import { useContributionStore } from "@/store/contributionStore";
import { useAuthStore } from "@/store/authStore";

interface AddContributionModalProps {
  open: boolean;
  onClose: () => void;
}

export function AddContributionModal({ open, onClose }: AddContributionModalProps) {
  const { colors } = useTheme();
  const token = useAuthStore((state) => state.token);
  const add = useContributionStore((state) => state.add);
  const loading = useContributionStore((state) => state.mutating);

  // Form state
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<"Mpesa" | "Bank" | "cash">("Mpesa");
  const [phone, setPhone] = useState("");
  const [reference, setReference] = useState("");

  // UI state
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit() {
    setError("");
    setSuccess("");

    // Validation
    const numAmount = Number(amount);
    if (!amount || numAmount <= 0) {
      return setError("Enter a contribution amount greater than zero.");
    }

    if (method === "Mpesa" && !phone.trim()) {
      return setError("Enter a phone number for M-Pesa.");
    }

    if (!token) {
      return setError("Session expired. Please login again.");
    }

    try {
      await add(token, {
        amount: numAmount,
        method,
        phone: phone.trim() || undefined,
        reference: reference.trim() || undefined,
      });

      setSuccess("Contribution submitted successfully!");

      // Reset form
      setAmount("");
      setPhone("");
      setReference("");
      setMethod("Mpesa");

      // Close after brief delay
      setTimeout(onClose, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit contribution.");
    }
  }

  function handleClose() {
    // Reset on close
    setAmount("");
    setPhone("");
    setReference("");
    setError("");
    setSuccess("");
    setMethod("Mpesa");
    onClose();
  }

  return (
    <AppDialog
      open={open}
      title="💳 Add Contribution"
      subtitle="Support your group's savings goal"
      onClose={handleClose}
      footer={
        <View style={{ flexDirection: "row", gap: 12 }}>
          <AppButton
            title="Cancel"
            variant="outline"
            onPress={handleClose}
            style={{ flex: 1 }}
          />
          <AppButton
            title={loading ? "Submitting..." : "Submit Contribution"}
            loading={loading}
            disabled={loading}
            onPress={handleSubmit}
            style={{ flex: 1 }}
          />
        </View>
      }
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <VStack className="gap-4 p-4">
          {/* Amount Field */}
          <FormField label="Amount (KES)" required>
            <AppInput
              value={amount}
              onChangeText={(text) => {
                setAmount(text.replace(/\D/g, ""));
                setError("");
              }}
              keyboardType="number-pad"
              placeholder="Enter amount"
              editable={!loading}
            />
          </FormField>

          {/* Payment Method Selection */}
          <FormField label="Payment Method" required>
            <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
              {(["Mpesa", "Bank", "cash"] as const).map((item) => (
                <AppButton
                  key={item}
                  title={item}
                  variant={method === item ? "default" : "outline"}
                  onPress={() => {
                    setMethod(item);
                    if (item !== "Mpesa") setPhone("");
                    setError("");
                  }}
                  style={{ flex: 1, minWidth: 80 }}
                  disabled={loading}
                />
              ))}
            </View>
          </FormField>

          {/* Phone Field (Conditional - M-Pesa only) */}
          {method === "Mpesa" && (
            <FormField label="Phone Number" required>
              <AppInput
                value={phone}
                onChangeText={(text) => {
                  setPhone(text);
                  setError("");
                }}
                keyboardType="phone-pad"
                placeholder="07XXXXXXXX"
                editable={!loading}
                maxLength={12}
              />
            </FormField>
          )}

          {/* Reference Field (Optional) */}
          <FormField label="Reference (Optional)">
            <AppInput
              value={reference}
              onChangeText={(text) => {
                setReference(text);
                setError("");
              }}
              placeholder="Transaction reference or note"
              editable={!loading}
              multiline
            />
          </FormField>

          {/* Amount Info */}
          <View style={{
            backgroundColor: colors.muted + "20",
            padding: 12,
            borderRadius: 8
          }}>
            <Text className="text-xs text-muted-foreground">
              💡 Contributions help your group reach its monthly savings target. All contributions go into the group fund.
            </Text>
          </View>

          {/* Error Display */}
          {error && (
            <View style={{
              backgroundColor: colors.error + "20",
              padding: 12,
              borderRadius: 8,
              borderLeftWidth: 4,
              borderLeftColor: colors.error
            }}>
              <Text style={{ color: colors.error, fontSize: 13 }}>
                ⚠️ {error}
              </Text>
            </View>
          )}

          {/* Success Display */}
          {success && (
            <View style={{
              backgroundColor: colors.success + "20",
              padding: 12,
              borderRadius: 8,
              borderLeftWidth: 4,
              borderLeftColor: colors.success
            }}>
              <Text style={{ color: colors.success, fontSize: 13 }}>
                ✓ {success}
              </Text>
            </View>
          )}
        </VStack>
      </ScrollView>
    </AppDialog>
  );
}
```

---

## DASHBOARD STATISTICS CARDS COMPONENT

```typescript
// components/Dashboard/StatsCard.tsx
import { View } from "react-native";
import { Text } from "@/components/ui/text";
import { useTheme } from "@/hooks/useTheme";

interface StatsCardProps {
  icon: string;
  title: string;
  value: string | number;
  subtitle?: string;
  status?: "positive" | "neutral" | "warning";
}

export function StatsCard({ icon, title, value, subtitle, status }: StatsCardProps) {
  const { colors } = useTheme();

  const bgColor = status === "positive"
    ? colors.success + "10"
    : status === "warning"
      ? colors.error + "10"
      : colors.muted + "10";

  const textColor = status === "positive"
    ? colors.success
    : status === "warning"
      ? colors.error
      : colors.textSecondary;

  return (
    <View
      style={{
        backgroundColor: bgColor,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderLeftWidth: 4,
        borderLeftColor: textColor,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <Text style={{ fontSize: 28 }}>{icon}</Text>
        <View style={{ flex: 1 }}>
          <Text className="text-xs text-muted-foreground">{title}</Text>
          <Text className="text-lg font-bold" style={{ color: colors.text }}>
            {value}
          </Text>
          {subtitle && (
            <Text className="text-xs text-muted-foreground mt-1">
              {subtitle}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}

// Usage in Dashboard
<StatsCard
  icon="💰"
  title="Total Contributions"
  value="KES 15,000"
  subtitle="Approved contributions"
  status="positive"
/>
<StatsCard
  icon="⏳"
  title="Pending Approval"
  value="KES 2,000"
  subtitle="Waiting for admin review"
  status="warning"
/>
```

---

## CONTRIBUTION LIST ITEM COMPONENT

```typescript
// components/Dashboard/ContributionItem.tsx
import { View, Pressable } from "react-native";
import { Text } from "@/components/ui/text";
import { useTheme } from "@/hooks/useTheme";
import { Contribution } from "@/types/member";

interface ContributionItemProps {
  contribution: Contribution;
  onPress?: () => void;
}

export function ContributionItem({ contribution, onPress }: ContributionItemProps) {
  const { colors } = useTheme();

  const statusColor = {
    approved: colors.success,
    pending: colors.warning,
    rejected: colors.error,
  }[contribution.status || "pending"];

  const statusLabel = {
    approved: "✓ Approved",
    pending: "⏳ Pending",
    rejected: "✗ Rejected",
  }[contribution.status || "pending"];

  const date = contribution.createdAt
    ? new Date(contribution.createdAt).toLocaleDateString()
    : `${contribution.month}/${contribution.year}`;

  return (
    <Pressable onPress={onPress}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: colors.card,
          borderRadius: 8,
          padding: 12,
          marginBottom: 8,
          borderLeftWidth: 4,
          borderLeftColor: statusColor,
        }}
      >
        <View style={{ flex: 1 }}>
          <Text className="font-semibold">
            {contribution.method || "Cash"} • KES {contribution.amount}
          </Text>
          <Text className="text-xs text-muted-foreground mt-1">
            {date}
          </Text>
          {contribution.reference && (
            <Text className="text-xs text-muted-foreground">
              Ref: {contribution.reference}
            </Text>
          )}
        </View>
        <Text style={{ color: statusColor }} className="font-medium text-sm">
          {statusLabel}
        </Text>
      </View>
    </Pressable>
  );
}
```

---

## ACTIVITY ITEM COMPONENT

```typescript
// components/Dashboard/ActivityItem.tsx
import { View } from "react-native";
import { Text } from "@/components/ui/text";
import { useTheme } from "@/hooks/useTheme";
import { Activity } from "@/types/activity";

interface ActivityItemProps {
  activity: Activity;
}

export function ActivityItem({ activity }: ActivityItemProps) {
  const { colors } = useTheme();

  const icon = {
    contribution_approved: "✓",
    contribution_rejected: "✗",
    contribution_submitted: "📝",
    loan_approved: "✓",
    loan_requested: "📋",
    loan_repaid: "💳",
    member_joined: "👤",
    target_reached: "🎉",
  }[activity.type] || "📌";

  const timestamp = new Date(activity.timestamp).toLocaleString();

  return (
    <View
      style={{
        flexDirection: "row",
        gap: 12,
        backgroundColor: colors.card,
        borderRadius: 8,
        padding: 12,
        marginBottom: 8,
      }}
    >
      <Text style={{ fontSize: 20 }}>{icon}</Text>
      <View style={{ flex: 1 }}>
        <Text className="font-medium">{activity.description}</Text>
        <Text className="text-xs text-muted-foreground mt-1">
          {timestamp}
        </Text>
        {activity.member && (
          <Text className="text-xs text-primary mt-1">
            by {activity.member}
          </Text>
        )}
      </View>
    </View>
  );
}
```

---

## CONTRIBUTION STORE ENHANCEMENT

```typescript
// store/dashboardStore.ts (NEW)
import { create } from "zustand";
import { api, authHeaders } from "@/services/api";

interface DashboardStats {
  totalSavings: number;
  monthlyTarget: number;
  progressPercent: number;
  userTotalContribution: number;
  userPendingAmount: number;
  activeLoans: number;
  loansDueForRepayment: number;
  contributionStatus: "ontrack" | "behind" | "ahead";
}

interface DashboardStore {
  stats: DashboardStats | null;
  loading: boolean;
  error?: string;

  fetchStats: (token: string) => Promise<void>;
}

export const useDashboardStore = create<DashboardStore>((set) => ({
  stats: null,
  loading: false,
  error: undefined,

  fetchStats: async (token: string) => {
    set({ loading: true, error: undefined });
    try {
      // Fetch all required data
      const [userRes, groupRes, contribRes, loansRes] = await Promise.all([
        api.get("/users/summary", { headers: authHeaders(token) }),
        api.get("/groups/my-group", { headers: authHeaders(token) }),
        api.get("/contributions/my-contributions?pageSize=100", {
          headers: authHeaders(token),
        }),
        api.get("/credit-management/loans", { headers: authHeaders(token) }),
      ]);

      const group = groupRes.data;
      const user = userRes.data;
      const contributions = contribRes.data.results || [];
      const loans = loansRes.data.results || [];

      // Calculate stats
      const userTotalContribution = user.userContributions.approved || 0;
      const userPendingAmount = user.userContributions.pending || 0;
      const activeLoans = user.loans.active || 0;
      const loansDueForRepayment = user.loans.dueForRepayment || 0;

      const progressPercent = Math.round(
        (group.totalSavings / (group.monthlyTarget || 1)) * 100,
      );

      set({
        stats: {
          totalSavings: group.totalSavings,
          monthlyTarget: group.monthlyTarget,
          progressPercent,
          userTotalContribution,
          userPendingAmount,
          activeLoans,
          loansDueForRepayment,
          contributionStatus:
            userTotalContribution >= group.monthlyTarget ? "ahead" : "ontrack",
        },
        loading: false,
      });
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch dashboard stats",
        loading: false,
      });
    }
  },
}));
```

---

## COMPLETE DASHBOARD SCREEN TEMPLATE

```typescript
// app/(tabs)/dashboard.tsx (NEW STRUCTURE)
import { useEffect, useState } from "react";
import { ScrollView, RefreshControl, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Screen } from "@/components/layout/Screen";
import { useAuthStore } from "@/store/authStore";
import { useGroupStore } from "@/store/groupStore";
import { useDashboardStore } from "@/store/dashboardStore";
import { useContributionStore } from "@/store/contributionStore";
import { AddContributionModal } from "@/components/DashboardModals/AddContributionModal";
import { StatsCard } from "@/components/Dashboard/StatsCard";
import { ContributionItem } from "@/components/Dashboard/ContributionItem";
import { ActivityItem } from "@/components/Dashboard/ActivityItem";

export default function DashboardScreen() {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const group = useGroupStore((state) => state.group);

  const stats = useDashboardStore((state) => state.stats);
  const fetchStats = useDashboardStore((state) => state.fetchStats);
  const statsLoading = useDashboardStore((state) => state.loading);

  const contributions = useContributionStore((state) => state.contributions);
  const fetchContributions = useContributionStore((state) => state.fetch);

  const [modalOpen, setModalOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Load data on screen focus
  useFocusEffect(
    useCallback(() => {
      if (token) {
        fetchStats(token);
        fetchContributions(token);
      }
    }, [token])
  );

  // Pull-to-refresh
  async function handleRefresh() {
    setRefreshing(true);
    if (token) {
      await Promise.all([
        fetchStats(token),
        fetchContributions(token),
      ]);
    }
    setRefreshing(false);
  }

  return (
    <Screen>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={{ padding: 16, gap: 20 }}>
          {/* 1. HEADER */}
          <HeaderSection user={user} />

          {/* 2. SAVINGS SUMMARY CARD */}
          <SavingsSummaryCard
            group={group}
            stats={stats}
            userContribution={stats?.userTotalContribution || 0}
          />

          {/* 3. QUICK ACTIONS */}
          <QuickActions
            onDeposit={() => setModalOpen(true)}
            onRequestLoan={() => {}}
            onRepay={() => {}}
          />

          {/* 4. FINANCIAL OVERVIEW */}
          <FinancialOverviewSection stats={stats} />

          {/* 5. MY CONTRIBUTIONS */}
          <MyContributionsSection contributions={contributions} />

          {/* 6. RECENT ACTIVITIES */}
          <RecentActivitiesSection />

          {/* Modal */}
          <AddContributionModal
            open={modalOpen}
            onClose={() => setModalOpen(false)}
          />
        </View>
      </ScrollView>
    </Screen>
  );
}
```

---

## QUICK IMPLEMENTATION CHECKLIST

- [ ] Create `DASHBOARD-REDESIGN-SPEC.md` (✓ Done)
- [ ] Backend: Add `/users/summary` endpoint
- [ ] Frontend: Create `useDashboardStore` hook
- [ ] Frontend: Create modal components
- [ ] Frontend: Create stats card components
- [ ] Frontend: Create contribution list component
- [ ] Frontend: Create activity item component
- [ ] Frontend: Update main dashboard screen
- [ ] Test: Verify all API calls working
- [ ] Test: Test contribution submission flow
- [ ] Test: Test pull-to-refresh
- [ ] Deploy & monitor
