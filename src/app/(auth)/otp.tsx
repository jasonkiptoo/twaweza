import { Screen } from "@/components/layout/Screen";
import { Button, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { useTheme } from "@/hooks/useTheme";
import { useAuthStore } from "@/store/authStore";
import { router } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    TextInput,
} from "react-native";

export default function OtpScreen() {
  const { colors } = useTheme();
  const pendingEmail = useAuthStore((state) => state.pendingOtpEmail);
  const userEmail = useAuthStore((state) => state.user?.email);
  const email = pendingEmail ?? userEmail ?? "";
  const verify = useAuthStore((state) => state.verifyOtp);
  const resend = useAuthStore((state) => state.generateOtp);
  const [digits, setDigits] = useState(["", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [sendingInitialCode, setSendingInitialCode] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(300);
  const inputs = useRef<Array<TextInput | null>>([]);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const interval = setInterval(
      () => setSecondsLeft((value) => value - 1),
      1000,
    );
    return () => clearInterval(interval);
  }, [secondsLeft]);

  useEffect(() => {
    if (!email) return;
    let active = true;
    setSendingInitialCode(true);
    void resend({ email })
      .catch(() => active && setError("We could not send a verification code."))
      .finally(() => active && setSendingInitialCode(false));
    return () => {
      active = false;
    };
  }, [email, resend]);

  function updateDigit(index: number, value: string) {
    const clean = value.replace(/\D/g, "");
    if (clean.length > 1) {
      const pasted = clean.slice(0, 4).split("");
      setDigits((current) =>
        current.map((digit, position) => pasted[position] ?? digit),
      );
      inputs.current[Math.min(pasted.length, 4) - 1]?.focus();
    } else {
      setDigits((current) =>
        current.map((digit, position) => (position === index ? clean : digit)),
      );
      if (clean && index < 3) inputs.current[index + 1]?.focus();
    }
    setError("");
  }

  function handleKeyPress(index: number, key: string) {
    if (key === "Backspace" && !digits[index] && index > 0)
      inputs.current[index - 1]?.focus();
  }

  async function handleVerify() {
    const otp = digits.join("");
    if (!email)
      return setError(
        "Your verification email is missing. Return to sign in and try again.",
      );
    if (!/^\d{4}$/.test(otp))
      return setError("Enter the 4-digit verification code.");
    setLoading(true);
    setError("");
    try {
      await verify({ email, otp });
      await useAuthStore.getState().fetchCurrentUser();
      router.replace("/(tabs)/dashboard");
    } catch {
      setError("We could not verify that code. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (secondsLeft > 0 || resending || !email) return;
    setResending(true);
    setError("");
    try {
      await resend({ email });
      setDigits(["", "", "", ""]);
      setSecondsLeft(300);
      inputs.current[0]?.focus();
    } catch {
      setError("We could not send a new code. Please try again.");
    } finally {
      setResending(false);
    }
  }

  function handleBack() {
    useAuthStore.getState().clearAuth();
    if (router.canGoBack()) router.back();
    else router.replace("/(auth)/login");
  }

  const time = `${String(Math.floor(secondsLeft / 60)).padStart(2, "0")}:${String(secondsLeft % 60).padStart(2, "0")}`;
  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 24 : 0}
        style={{ flex: 1 }}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            paddingBottom: 40,
          }}
        >
          <VStack
            className="gap-7 self-center"
            style={{ maxWidth: 440, width: "100%" }}
          >
            <Button
              variant="link"
              onPress={handleBack}
              accessibilityLabel="Back"
            >
              <ArrowLeft size={18} color={colors.primary} />
              <ButtonText>Back</ButtonText>
            </Button>
            <VStack className="gap-2">
              <Heading size="3xl">Verify your account</Heading>
              <Text className="text-muted-foreground">
                Enter the 4-digit code sent to {email || "your email address"}.
              </Text>
            </VStack>
            <VStack className="gap-3">
              <Text bold>Verification code</Text>
              <VStack className="flex-row justify-between">
                <>
                  {digits.map((digit, index) => (
                    <Pressable
                      key={index}
                      onPress={() => inputs.current[index]?.focus()}
                    >
                      <TextInput
                        ref={(input) => {
                          inputs.current[index] = input;
                        }}
                        value={digit}
                        onChangeText={(value) => updateDigit(index, value)}
                        onKeyPress={({ nativeEvent }) =>
                          handleKeyPress(index, nativeEvent.key)
                        }
                        keyboardType="number-pad"
                        maxLength={4}
                        style={{
                          width: 64,
                          height: 58,
                          borderRadius: 12,
                          borderWidth: 1,
                          borderColor: error ? colors.error : colors.border,
                          color: colors.textPrimary,
                          backgroundColor: colors.card,
                          textAlign: "center",
                          fontSize: 20,
                          fontWeight: "700",
                        }}
                        accessibilityLabel={`Verification digit ${index + 1}`}
                      />
                    </Pressable>
                  ))}
                </>
              </VStack>
              {error && <Text className="text-error">{error}</Text>}
            </VStack>
            <Button
              size="lg"
              onPress={handleVerify}
              isDisabled={loading || sendingInitialCode}
            >
              <ButtonText>
                {loading
                  ? "Verifying..."
                  : sendingInitialCode
                    ? "Sending code..."
                    : "Verify code"}
              </ButtonText>
            </Button>
            <Text className="text-center text-muted-foreground">
              {secondsLeft > 0
                ? `Resend available in ${time}`
                : "Did not receive a code?"}
            </Text>
            <Button
              variant="link"
              onPress={handleResend}
              isDisabled={
                secondsLeft > 0 || resending || sendingInitialCode || !email
              }
            >
              <ButtonText>
                {resending ? "Sending..." : "Resend code"}
              </ButtonText>
            </Button>
          </VStack>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
