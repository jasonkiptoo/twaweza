import { useEffect, useState } from "react";
import { router } from "expo-router";
import { LogOut, Moon, Sun, UserRound, Settings } from "lucide-react-native";
import { Screen } from "@/components/layout/Screen";
import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { CurrencyAmount } from "@/components/ui/CurrencyAmount";
import { Heading } from "@/components/ui/heading";
import { IconButton } from "@/components/ui/IconButton";
import { Text } from "@/components/ui/text";
import { View } from "react-native";
import { VStack } from "@/components/ui/vstack";
import { useTheme } from "@/hooks/useTheme";
import { useAuthStore } from "@/store/authStore";
import { useUserStore } from "@/store/userStore";
import { hasRole } from "@/types/auth";

export default function ProfileScreen() {
  const { colors, isDark, toggleTheme } = useTheme();
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const logout = useAuthStore((state) => state.logout);
  const summary = useUserStore((state) => state.summary) as
    { user_contribution?: number; user_loans_balance?: number } | undefined;
  const fetchSummary = useUserStore((state) => state.fetchSummary);
  const [loggingOut, setLoggingOut] = useState(false);
  useEffect(() => {
    if (token) void fetchSummary(token);
  }, [fetchSummary, token]);
  async function handleLogout() {
    setLoggingOut(true);
    logout();
    router.replace("/(auth)/login");
  }
  return (
    <Screen>
      <VStack className="gap-5">
        <ViewHeader colors={colors} isDark={isDark} toggleTheme={toggleTheme} />
        <AppCard>
          <VStack className="items-center gap-3">
            <VStack
              style={{
                width: 72,
                height: 72,
                borderRadius: 36,
                backgroundColor: colors.primary,
              }}
              className="items-center justify-center"
            >
              <UserRound color={colors.onPrimary} size={32} />
            </VStack>
            <Heading size="xl">
              {user?.firstName || user?.lastName
                ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim()
                : (user?.username ?? "SaveSmart member")}
            </Heading>
            <Text className="text-muted-foreground">
              {user?.email ?? "Account details unavailable"}
            </Text>
          </VStack>
        </AppCard>
        <VStack className="gap-3">
          <Heading size="lg">Financial overview</Heading>
          <AppCard>
            <VStack className="gap-3">
              <View className="flex-row justify-between">
                <Text>Member contribution</Text>
                <CurrencyAmount value={summary?.user_contribution} />
              </View>
              <View className="flex-row justify-between">
                <Text>Loan balance</Text>
                <CurrencyAmount value={summary?.user_loans_balance} />
              </View>
            </VStack>
          </AppCard>
        </VStack>
        <AppButton
          title={isDark ? "Use light theme" : "Use dark theme"}
          onPress={toggleTheme}
        />
        {hasRole(user, "admin") && (
          <AppButton
            title="Group Administration"
            variant="outline"
            onPress={() => router.push("/admin")}
          />
        )}
        <AppButton
          title={loggingOut ? "Signing out..." : "Sign out"}
          variant="destructive"
          onPress={handleLogout}
          isDisabled={loggingOut}
        />
      </VStack>
    </Screen>
  );
}

function ViewHeader({
  colors,
  isDark,
  toggleTheme,
}: {
  colors: { textSecondary: string };
  isDark: boolean;
  toggleTheme: () => void;
}) {
  return (
    <VStack className="flex-row items-center justify-between">
      <VStack>
        <Text style={{ color: colors.textSecondary }}>Account</Text>
        <Heading size="3xl">Profile</Heading>
      </VStack>
      <IconButton label="Toggle theme" onPress={toggleTheme}>
        {isDark ? (
          <Sun color={colors.textSecondary} size={22} />
        ) : (
          <Moon color={colors.textSecondary} size={22} />
        )}
      </IconButton>
    </VStack>
  );
}
