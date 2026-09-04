import { useAuthStore } from "@/store/authStore";
import { hasRole } from "@/types/auth";
import { Redirect, Stack } from "expo-router";

export default function AdminLayout() {
  const status = useAuthStore((state) => state.status);
  const otpRequired = useAuthStore((state) => state.otpRequired);
  const user = useAuthStore((state) => state.user);
  
  // 🔒 SECURITY: Only authenticated users can enter admin section
  if (status !== "authenticated") return <Redirect href="/(auth)/login" />;
  if (otpRequired) return <Redirect href="/(auth)/otp" />;
  
  // 🔒 SECURITY: Only admins can access admin routes
  if (!hasRole(user, "admin")) return <Redirect href="/(tabs)" />;
  
  return <Stack screenOptions={{ headerShown: false }} />;
}
