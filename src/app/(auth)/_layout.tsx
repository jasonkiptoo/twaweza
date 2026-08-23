import { Redirect, Stack, usePathname } from "expo-router";
import { useAuthStore } from "@/store/authStore";

export default function AuthLayout() {
  const status = useAuthStore((state) => state.status);
  const otpRequired = useAuthStore((state) => state.otpRequired);
  const pathname = usePathname();
  return (
    <>
      {status === "authenticated" && otpRequired && pathname !== "/otp" ? (
        <Redirect href="/(auth)/otp" />
      ) : (
        <Stack screenOptions={{ headerShown: false }} />
      )}
    </>
  );
}
