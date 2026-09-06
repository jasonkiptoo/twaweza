import { useCallback, useEffect, useState } from "react";
import { RefreshControl, ScrollView, View } from "react-native";
import { Landmark, Settings, Users } from "lucide-react-native";
import { Screen } from "@/components/layout/Screen";
import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { AppEmptyState, AppErrorState } from "@/components/ui/AppStates";
import { AppSkeleton } from "@/components/ui/AppSkeleton";
import { CurrencyAmount } from "@/components/ui/CurrencyAmount";
import { Heading } from "@/components/ui/heading";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { useTheme } from "@/hooks/useTheme";
import { useAuthStore } from "@/store/authStore";
import { useGroupStore } from "@/store/groupStore";
import { useContributionStore } from "@/store/contributionStore";
import { isAdmin } from "@/types/auth";
import { useRouter } from "expo-router";

const sections = ["Overview", "Contributions", "Members", "Bank Info"] as const;
type GroupSection = (typeof sections)[number];

export default function GroupScreen() {
  const { colors } = useTheme();
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const router = useRouter();
  const group = useGroupStore((state) => state.group);
  const groupLoading = useGroupStore((state) => state.isLoading);
  const groupError = useGroupStore((state) => state.error);
  const fetchGroup = useGroupStore((state) => state.fetchGroup);
  const contributions = useContributionStore((state) => state.contributions);
  const contributionLoading = useContributionStore((state) => state.loading);
  const contributionError = useContributionStore((state) => state.error);
  const fetchContributions = useContributionStore((state) => state.fetch);
  const [section, setSection] = useState<GroupSection>("Overview");
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!token) return;
    await fetchGroup(token);
    if (section === "Contributions") await fetchContributions(token, 1);
  }, [fetchContributions, fetchGroup, section, token]);
  useEffect(() => {
    void load();
  }, [load]);

  async function refresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }
  const error = groupError || contributionError;
  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor={colors.primary}
          />
        }
        contentContainerStyle={{ gap: 20, paddingBottom: 32 }}
      >
        <VStack className="gap-1">
          <Text className="text-muted-foreground">Your savings community</Text>
          <Heading size="3xl">The Squad</Heading>
        </VStack>
        <ScrollView
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          horizontal
          contentContainerStyle={{ gap: 8 }}
        >
          {sections.map((item) => (
            <AppButton
              key={item}
              title={item}
              variant={section === item ? "default" : "outline"}
              onPress={() => setSection(item)}
            />
          ))}
        </ScrollView>
        {error && <AppErrorState message={error} onRetry={load} />}
        {section === "Overview" &&
          (groupLoading && !group ? (
            <AppSkeleton height={180} />
          ) : group ? (
            <AppCard>
              <VStack className="gap-3">
                <View className="flex-row items-center gap-3">
                  <Users color={colors.primary} size={24} />
                  <Heading size="xl">{group.name ?? "Your group"}</Heading>
                </View>
                <Text className="text-muted-foreground">
                  {group.description || "A focused space for shared savings."}
                </Text>
                <View className="flex-row justify-between">
                  <VStack>
                    <Text size="sm" className="text-muted-foreground">
                      Total savings
                    </Text>
                    <CurrencyAmount value={group.totalSavings} />
                  </VStack>
                  <VStack>
                    <Text size="sm" className="text-muted-foreground">
                      Monthly target
                    </Text>
                    <CurrencyAmount value={group.monthlyTarget} />
                  </VStack>
                </View>
                <View className="flex-row items-center justify-between">
                  <Text className="text-muted-foreground">
                    Code: {group.code ?? "Not available"}
                  </Text>
                  <StatusBadge status={group.status} />
                </View>
                {group.location && (
                  <Text className="text-muted-foreground">
                    {group.location.city}, {group.location.country}
                  </Text>
                )}
              </VStack>
            </AppCard>
          ) : (
            <AppEmptyState
              title="Group unavailable"
              message="We could not find your group details."
            />
          ))}
        {section === "Contributions" && (
          <VStack className="gap-3">
            {contributionLoading && !contributions.length && (
              <AppSkeleton height={140} />
            )}
            {!contributionLoading &&
              !contributionError &&
              !contributions.length && (
                <AppEmptyState
                  title="No contributions"
                  message="Your group contribution history will appear here."
                />
              )}
            {contributions.slice(0, 5).map((item) => (
              <AppCard key={item.id}>
                <View className="flex-row items-center justify-between">
                  <VStack className="gap-1">
                    <Text className="font-semibold">
                      {item.month ?? ""} {item.year ?? ""}
                    </Text>
                    <Text size="sm" className="text-muted-foreground">
                      {item.paymentMethod ?? "Payment method unavailable"}
                    </Text>
                  </VStack>
                  <VStack className="items-end gap-1">
                    <CurrencyAmount value={item.amount} />
                    <StatusBadge status={item.status} />
                  </VStack>
                </View>
              </AppCard>
            ))}
          </VStack>
        )}
        {section === "Members" && (
          <VStack className="gap-3">
            {group?.members?.length ? (
              group.members.map((member) => (
                <AppCard key={member.id ?? member._id ?? member.username}>
                  <View className="flex-row items-center gap-3">
                    <View
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        backgroundColor: colors.secondary,
                      }}
                      className="items-center justify-center"
                    >
                      <Text style={{ color: colors.onPrimary }}>
                        {(
                          member.first_name?.[0] ??
                          member.username?.[0] ??
                          "?"
                        ).toUpperCase()}
                      </Text>
                    </View>
                    <VStack className="flex-1">
                      <Text className="font-semibold">
                        {member.first_name || member.last_name
                          ? `${member.first_name ?? ""} ${member.last_name ?? ""}`.trim()
                          : member.username}
                      </Text>
                      <Text size="sm" className="text-muted-foreground">
                        @{member.username ?? "member"}
                      </Text>
                    </VStack>
                    <StatusBadge status={member.role} />
                  </View>
                </AppCard>
              ))
            ) : (
              <AppEmptyState
                title="No members to show"
                message="Member details are not available yet."
              />
            )}
          </VStack>
        )}
        {section === "Bank Info" && (
          <VStack className="gap-3">
            {group?.banks?.length ? (
              group.banks.map((bank, index) => (
                <AppCard key={`${bank.name ?? "bank"}-${index}`}>
                  <View className="flex-row gap-3">
                    <Landmark color={colors.primary} size={22} />
                    <VStack>
                      <Text className="font-semibold">
                        {bank.name ?? "Bank account"}
                      </Text>
                      <Text size="sm" className="text-muted-foreground">
                        {bank.accountName ?? "Account details unavailable"}
                      </Text>
                      <Text size="sm" className="text-muted-foreground">
                        {bank.accountNumber ?? "Account number unavailable"}
                      </Text>
                    </VStack>
                  </View>
                </AppCard>
              ))
            ) : (
              <AppEmptyState
                title="Bank information unavailable"
                message="Your group has not provided bank details yet."
              />
            )}
          </VStack>
        )}
        {isAdmin(user) && (
          <AppCard>
            <View className="flex-row items-center gap-3">
              <Settings color={colors.primary} size={22} />
              <VStack className="flex-1 gap-1">
                <Heading size="lg">Admin settings</Heading>
                <Text className="text-muted-foreground">
                  Manage contributions, loan products, approvals, and members.
                </Text>
              </VStack>
              <AppButton title="Open" onPress={() => router.push("/admin")} />
            </View>
          </AppCard>
        )}
      </ScrollView>
    </Screen>
  );
}
