import { Screen } from "@/components/layout/Screen";
import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { env } from "@/config/env";
import { useTheme } from "@/hooks/useTheme";
import { useAuthStore } from "@/store/authStore";
import { Link, router } from "expo-router";
import { Eye, EyeOff, PiggyBank } from "lucide-react-native";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  View,
} from "react-native";

const developmentCredentials = {
  email: "andrewtate@gmail.com",
  password: "123456",
};

export default function LoginScreen() {
  const { colors } = useTheme();
  const signIn = useAuthStore((state) => state.login);
  const error = useAuthStore((state) => state.error);
  const loading = useAuthStore((state) => state.isLoading);
  const clearError = useAuthStore((state) => state.clearError);
  const [email, setEmail] = useState(
    env.isDevelopment ? developmentCredentials.email : "",
  );
  const [password, setPassword] = useState(
    env.isDevelopment ? developmentCredentials.password : "",
  );
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState("");

  async function handleSubmit() {
    clearError();
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email))
      return setValidationError("Enter a valid email address.");
    if (!password) return setValidationError("Enter your password.");
    setValidationError("");
    try {
      const response = await signIn({ email: email.trim(), password });
      const user =
        response.user ?? (await useAuthStore.getState().fetchCurrentUser());
      router.replace(
        user?.otpVerified === false ? "/(auth)/otp" : "/(tabs)/dashboard",
      );
    } catch {
      // The store exposes the normalized error to the screen.
    }
  }

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 24 : 0}
        style={{ flex: 1 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            paddingBottom: 32,
          }}
          keyboardShouldPersistTaps="handled"
        >
          <Box className="w-full self-center" style={{ maxWidth: 440 }}>
            <VStack className="gap-8">
              <VStack className="items-center gap-3">
                <View
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 20,
                    backgroundColor: colors.primary,
                  }}
                  className="items-center justify-center"
                >
                  <PiggyBank
                    color={colors.onPrimary}
                    size={32}
                    strokeWidth={2}
                  />
                </View>
                <Heading size="3xl" className="text-center">
                  SaveSmart
                </Heading>
                <Text className="text-center text-muted-foreground">
                  Save now, or never
                </Text>
              </VStack>

              <VStack className="gap-5 rounded-xl border border-border bg-card p-6">
                <VStack className="gap-1">
                  <Heading size="xl">Welcome back</Heading>
                  <Text className="text-muted-foreground">
                    Sign in to continue building your savings.
                  </Text>
                </VStack>
                <VStack className="gap-4">
                  <VStack className="gap-2">
                    <Text bold>Email address</Text>
                    <Input isInvalid={Boolean(validationError && !email)}>
                      <InputField
                        value={email}
                        onChangeText={(value) => {
                          setEmail(value);
                          clearError();
                          setValidationError("");
                        }}
                        placeholder="you@example.com"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoComplete="email"
                        accessibilityLabel="Email address"
                      />
                    </Input>
                  </VStack>
                  <VStack className="gap-2">
                    <Text bold>Password</Text>
                    <Input isInvalid={Boolean(validationError && !password)}>
                      <InputField
                        value={password}
                        onChangeText={(value) => {
                          setPassword(value);
                          clearError();
                          setValidationError("");
                        }}
                        placeholder="Your password"
                        secureTextEntry={!showPassword}
                        autoComplete="password"
                        accessibilityLabel="Password"
                      />
                      <InputSlot
                        onPress={() => setShowPassword((value) => !value)}
                        style={{ minWidth: 44, minHeight: 44 }}
                        accessibilityLabel={
                          showPassword ? "Hide password" : "Show password"
                        }
                      >
                        <InputIcon
                          as={showPassword ? EyeOff : Eye}
                          color={colors.textSecondary}
                          size={20}
                        />
                      </InputSlot>
                    </Input>
                  </VStack>
                  <Link href="/(auth)/forgot-password" asChild>
                    <Pressable>
                      <Text className="text-sm text-primary text-right">
                        Forgot password?
                      </Text>
                    </Pressable>
                  </Link>
                </VStack>
                {(validationError || error) && (
                  <Text style={{ color: colors.error }}>
                    {validationError || error}
                  </Text>
                )}
                <Button
                  size="lg"
                  onPress={handleSubmit}
                  isDisabled={loading}
                  accessibilityLabel="Sign in"
                >
                  <ButtonText>
                    {loading ? "Signing in..." : "Sign in"}
                  </ButtonText>
                </Button>
                <Text className="text-center text-muted-foreground">
                  New to SaveSmart?{" "}
                  <Link href="/(auth)/signup" asChild>
                    <Pressable>
                      <Text className="font-semibold text-primary">
                        Create an account
                      </Text>
                    </Pressable>
                  </Link>
                </Text>
              </VStack>
            </VStack>
          </Box>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
