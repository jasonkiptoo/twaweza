import { Screen } from "@/components/layout/Screen";
import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { useTheme } from "@/hooks/useTheme";
import { resetPasswordRequest } from "@/services/authApi";
import { Link, router } from "expo-router";
import { ArrowLeft, Eye, EyeOff, Lock, PiggyBank } from "lucide-react-native";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  View,
} from "react-native";

export default function ResetPasswordScreen() {
  const { colors } = useTheme();
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setValidationError("");
    setSuccessMessage("");

    if (!token.trim()) {
      return setValidationError("Enter the reset code from your email.");
    }

    if (!password || password.length < 6) {
      return setValidationError("Password must be at least 6 characters.");
    }

    if (!confirmPassword) {
      return setValidationError("Please confirm your password.");
    }

    if (password !== confirmPassword) {
      return setValidationError("Passwords do not match.");
    }

    setLoading(true);
    try {
      const response = await resetPasswordRequest(
        token.trim(),
        password,
        confirmPassword,
      );
      setSuccessMessage("Password reset successfully! Redirecting to login...");

      // Clear form
      setToken("");
      setPassword("");
      setConfirmPassword("");

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.replace("/(auth)/login");
      }, 2000);
    } catch (error: any) {
      setValidationError(
        error?.message ||
          "Failed to reset password. Please check your code and try again.",
      );
    } finally {
      setLoading(false);
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
            {/* Back Button */}
            <Pressable
              onPress={() => router.push("/(auth)/forgot-password")}
              className="mb-4"
            >
              <View className="flex-row items-center gap-2">
                <ArrowLeft color={colors.primary} size={20} />
                <Text style={{ color: colors.primary }}>Back</Text>
              </View>
            </Pressable>

            <VStack className="gap-8">
              {/* Header */}
              <VStack className="items-center gap-3">
                <View
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 28,
                    backgroundColor: colors.primary + "20",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Lock color={colors.primary} size={28} />
                </View>
                <VStack className="items-center gap-1">
                  <Heading size="2xl">Reset Your Password</Heading>
                  <Text className="text-center text-muted-foreground">
                    Enter the code from your email and your new password.
                  </Text>
                </VStack>
              </VStack>

              {/* Form */}
              <VStack className="gap-4">
                {/* Reset Code Input */}
                <VStack className="gap-2">
                  <Text className="font-semibold">Reset Code</Text>
                  <Input variant="outline" size="md">
                    <InputSlot>
                      <Lock color={colors.muted} size={18} />
                    </InputSlot>
                    <InputField
                      placeholder="Enter code from email"
                      value={token}
                      onChangeText={(value) => {
                        setToken(value.toUpperCase());
                        setValidationError("");
                      }}
                      editable={!loading}
                      autoCapitalize="characters"
                      maxLength={20}
                    />
                  </Input>
                </VStack>

                {/* New Password Input */}
                <VStack className="gap-2">
                  <Text className="font-semibold">New Password</Text>
                  <Input variant="outline" size="md">
                    <InputSlot>
                      <Lock color={colors.muted} size={18} />
                    </InputSlot>
                    <InputField
                      placeholder="Enter new password"
                      value={password}
                      onChangeText={(value) => {
                        setPassword(value);
                        setValidationError("");
                      }}
                      editable={!loading}
                      secureTextEntry={!showPassword}
                    />
                    <InputSlot
                      onPress={() => setShowPassword(!showPassword)}
                      style={{ paddingRight: 16 }}
                    >
                      {showPassword ? (
                        <Eye color={colors.muted} size={18} />
                      ) : (
                        <EyeOff color={colors.muted} size={18} />
                      )}
                    </InputSlot>
                  </Input>
                </VStack>

                {/* Confirm Password Input */}
                <VStack className="gap-2">
                  <Text className="font-semibold">Confirm Password</Text>
                  <Input variant="outline" size="md">
                    <InputSlot>
                      <Lock color={colors.muted} size={18} />
                    </InputSlot>
                    <InputField
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChangeText={(value) => {
                        setConfirmPassword(value);
                        setValidationError("");
                      }}
                      editable={!loading}
                      secureTextEntry={!showConfirmPassword}
                    />
                    <InputSlot
                      onPress={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      style={{ paddingRight: 16 }}
                    >
                      {showConfirmPassword ? (
                        <Eye color={colors.muted} size={18} />
                      ) : (
                        <EyeOff color={colors.muted} size={18} />
                      )}
                    </InputSlot>
                  </Input>
                </VStack>

                {/* Password Requirements Info */}
                <View
                  style={{
                    backgroundColor: colors.muted + "10",
                    padding: 12,
                    borderRadius: 6,
                    borderLeftWidth: 4,
                    borderLeftColor: colors.muted,
                  }}
                >
                  <Text className="text-xs text-muted-foreground">
                    • Minimum 6 characters
                    {"\n"}• Must match confirmation
                    {"\n"}• Use mix of letters and numbers for security
                  </Text>
                </View>

                {/* Validation Error */}
                {validationError ? (
                  <Text
                    style={{
                      color: colors.error,
                      fontSize: 14,
                      marginTop: -8,
                    }}
                  >
                    {validationError}
                  </Text>
                ) : null}

                {/* Success Message */}
                {successMessage ? (
                  <View
                    style={{
                      backgroundColor: colors.success + "20",
                      borderLeftWidth: 4,
                      borderLeftColor: colors.success,
                      padding: 12,
                      borderRadius: 6,
                    }}
                  >
                    <Text style={{ color: colors.success }}>
                      {successMessage}
                    </Text>
                  </View>
                ) : null}

                {/* Submit Button */}
                <Button
                  size="lg"
                  className="w-full mt-4"
                  onPress={handleSubmit}
                  disabled={loading}
                  style={{
                    backgroundColor: loading ? colors.muted : colors.primary,
                  }}
                >
                  <ButtonText>
                    {loading ? "Resetting..." : "Reset Password"}
                  </ButtonText>
                </Button>
              </VStack>

              {/* Footer */}
              <VStack className="items-center gap-1">
                <Text className="text-sm text-muted-foreground">
                  Didn't receive the code?{" "}
                  <Link href="/(auth)/forgot-password" asChild>
                    <Pressable>
                      <Text
                        style={{ color: colors.primary }}
                        className="font-semibold"
                      >
                        Request Again
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
