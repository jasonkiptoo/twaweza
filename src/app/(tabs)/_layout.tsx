import { Redirect, Tabs } from "expo-router";
import { Home, Users, WalletCards, UserRound } from "lucide-react-native";
import { useTheme } from "@/hooks/useTheme";
import { useAuthStore } from "@/store/authStore";

export default function TabsLayout() {
  const { colors } = useTheme();
  const status = useAuthStore((state) => state.status);
  const otpRequired = useAuthStore((state) => state.otpRequired);
  if (status !== "authenticated") return <Redirect href="/(auth)/login" />;
  if (otpRequired) return <Redirect href="/(auth)/otp" />;
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="group"
        options={{
          title: "Group",
          tabBarIcon: ({ color, size }) => <Users color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="loans"
        options={{
          title: "Loans",
          tabBarIcon: ({ color, size }) => (
            <WalletCards color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <UserRound color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen name="activity" options={{ href: null }} />
      <Tabs.Screen name="contributions" options={{ href: null }} />
      <Tabs.Screen name="credit-management" options={{ href: null }} />
    </Tabs>
  );
}
