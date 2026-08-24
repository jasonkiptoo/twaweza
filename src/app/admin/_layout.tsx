import { useAuthStore } from "@/store/authStore";
import { Redirect, Stack } from "expo-router";

export default function AdminLayout() {
  const status = useAuthStore((state) => state.status);
  const otpRequired = useAuthStore((state) => state.otpRequired);
  if (status !== "authenticated") return <Redirect href="/(auth)/login" />;
  if (otpRequired) return <Redirect href="/(auth)/otp" />;
  return <Stack screenOptions={{ headerShown: false }} />;
}
