import { Redirect, Stack } from "expo-router";
import { useAuthStore } from "@/store/authStore";
import { isAdmin } from "@/types/auth";

export default function AdminLayout() {
  const status = useAuthStore((state) => state.status);
  const user = useAuthStore((state) => state.user);
  const otpRequired = useAuthStore((state) => state.otpRequired);
  if (status !== "authenticated") return <Redirect href="/(auth)/login" />;
  if (otpRequired) return <Redirect href="/(auth)/otp" />;
  if (!isAdmin(user)) return <Redirect href="/(tabs)/dashboard" />;
  return <Stack screenOptions={{ headerShown: false }} />;
}
