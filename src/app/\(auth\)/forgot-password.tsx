import { Screen } from "@/components/layout/Screen";
import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { useTheme } from "@/hooks/useTheme";
import { forgotPasswordRequest } from "@/services/authApi";
import { Link, router } from "expo-router";
import { ArrowLeft, Mail, PiggyBank } from "lucide-react-native";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  View,
} from "react-native";

export default function ForgotPasswordScreen() {
  const { colors } = useTheme();
  const [email, setEmail] = useState("");
  const [validationError, setValidationError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setValidationError("");
    setSuccessMessage("");

    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) {
      return setValidationError("Enter a valid email address.");
    }

    setLoading(true);
    try {
      const response = await forgotPasswordRequest(email.trim());
      setSuccessMessage(
        "Password reset instructions have been sent to your email. Check your inbox!",
      );
      setEmail("");

      // Redirect to reset password screen after 2 seconds
      setTimeout(() => {
        router.push("/(auth)/reset-password");
      }, 2000);
    } catch (error: any) {
      setValidationError(
        error?.message || "Failed to send reset email. Please try again.",
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
            <Pressable onPress={() => router.back()} className="mb-4">
              <View className="flex-row items-center gap-2">
                <ArrowLeft color={colors.primary} size={20} />
                <Text style={{ color: colors.primary }}>Back to Login</Text>
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
                  <Mail color={colors.primary} size={28} />
                </View>
                <VStack className="items-center gap-1">
                  <Heading size="2xl">Forgot Password?</Heading>
                  <Text className="text-center text-muted-foreground">
                    Enter your email address and we'll send you a link to reset
                    your password.
                  </Text>
                </VStack>
              </VStack>

              {/* Form */}
              <VStack className="gap-4">
                {/* Email Input */}
                <VStack className="gap-2">
                  <Text className="font-semibold">Email</Text>
                  <Input
                    variant="outline"
                    size="md"
                    isDisabled={false}
                    isInvalid={false}
                  >
                    <InputSlot>
                      <Mail color={colors.muted} size={18} />
                    </InputSlot>
                    <InputField
                      placeholder="your@email.com"
                      value={email}
                      onChangeText={(value) => {
                        setEmail(value);
                        setValidationError("");
                      }}
                      editable={!loading}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </Input>
                </VStack>

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
                    {loading ? "Sending..." : "Send Reset Link"}
                  </ButtonText>
                </Button>
              </VStack>

              {/* Footer */}
              <VStack className="items-center gap-1">
                <Text className="text-sm text-muted-foreground">
                  Remember your password?{" "}
                  <Link href="/(auth)/login" asChild>
                    <Pressable>
                      <Text
                        style={{ color: colors.primary }}
                        className="font-semibold"
                      >
                        Sign In
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
