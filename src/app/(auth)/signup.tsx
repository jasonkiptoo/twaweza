import { useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { Link, router } from "expo-router";
import { Screen } from "@/components/layout/Screen";
import { AppButton } from "@/components/ui/AppButton";
import { AppInput } from "@/components/ui/AppInput";
import { FormField } from "@/components/ui/FormField";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { useAuthStore } from "@/store/authStore";
import { useTheme } from "@/hooks/useTheme";
import { useDebounce } from "@/hooks/useDebounce";
import { getApiErrorDetails, getApiErrorMessage } from "@/utils/apiError";

type SignupType = "create_group" | "join_group";
type SignupField =
  | "username"
  | "email"
  | "password"
  | "first_name"
  | "last_name"
  | "phone"
  | "signupType"
  | "groupName"
  | "groupDescription"
  | "monthlyTarget"
  | "city"
  | "country"
  | "groupCode";
interface SignupForm {
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone: string;
  signupType: SignupType;
  groupName: string;
  groupDescription: string;
  monthlyTarget: string;
  city: string;
  country: string;
  groupCode: string;
}
const initialForm: SignupForm = {
  username: "",
  email: "",
  password: "",
  first_name: "",
  last_name: "",
  phone: "",
  signupType: "join_group",
  groupName: "",
  groupDescription: "",
  monthlyTarget: "",
  city: "",
  country: "",
  groupCode: "",
};

export default function SignupScreen() {
  const signup = useAuthStore((state) => state.signup);
  const checkUsername = useAuthStore(
    (state) => state.checkUsernameAvailability,
  );
  const verifyGroupCode = useAuthStore((state) => state.verifyGroupCode);
  const loading = useAuthStore((state) => state.isLoading);
  const { colors } = useTheme();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [usernameStatus, setUsernameStatus] = useState("");
  const [groupStatus, setGroupStatus] = useState("");
  const debouncedUsername = useDebounce(form.username.trim(), 500);
  const update = (field: SignupField, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "", form: "" }));
    if (field === "username") setUsernameStatus("");
    if (field === "groupCode") setGroupStatus("");
  };
  useEffect(() => {
    if (
      debouncedUsername.length < 3 ||
      !/^[A-Za-z0-9_]+$/.test(debouncedUsername)
    )
      return;
    let active = true;
    setUsernameStatus("Checking username...");
    void checkUsername(debouncedUsername)
      .then(
        (result) =>
          active &&
          setUsernameStatus(
            result.available === false
              ? "Username unavailable."
              : "Username available.",
          ),
      )
      .catch(() => active && setUsernameStatus("Unable to check username."));
    return () => {
      active = false;
    };
  }, [checkUsername, debouncedUsername]);
  async function verifyCode() {
    const code = form.groupCode.trim().toUpperCase();
    update("groupCode", code);
    if (!code)
      return setErrors((current) => ({
        ...current,
        groupCode: "Enter a group code.",
      }));
    setGroupStatus("Checking group...");
    try {
      await verifyGroupCode(code);
      setGroupStatus("Valid group code.");
    } catch {
      setGroupStatus("Invalid group code.");
    }
  }
  function validateAccount() {
    const next: Record<string, string> = {};
    if (form.username.length < 3 || !/^[A-Za-z0-9_]+$/.test(form.username))
      next.username = "Use at least 3 letters, numbers, or underscores.";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = "Enter a valid email.";
    if (form.password.length < 6) next.password = "Use at least 6 characters.";
    if (!form.first_name.trim()) next.first_name = "Enter your first name.";
    if (!form.last_name.trim()) next.last_name = "Enter your last name.";
    if (!form.phone.trim()) next.phone = "Enter your phone number.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }
  function validateGroup() {
    const next: Record<string, string> = {};
    if (
      form.signupType === "join_group" &&
      (!form.groupCode.trim() || groupStatus !== "Valid group code.")
    )
      next.groupCode = "Verify a valid group code.";
    if (form.signupType === "create_group" && form.groupName.trim().length < 3)
      next.groupName = "Enter a group name.";
    if (
      form.signupType === "create_group" &&
      (!Number(form.monthlyTarget) || Number(form.monthlyTarget) <= 0)
    )
      next.monthlyTarget = "Enter a positive monthly target.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }
  async function submit() {
    if (!validateGroup()) return;
    const payload =
      form.signupType === "create_group"
        ? {
            username: form.username,
            email: form.email,
            password: form.password,
            first_name: form.first_name,
            last_name: form.last_name,
            phone: form.phone,
            signupType: "create_group" as const,
            groupData: {
              name: form.groupName,
              description: form.groupDescription,
              monthlyTarget: Number(form.monthlyTarget),
              location: { city: form.city, country: form.country },
            },
          }
        : {
            username: form.username,
            email: form.email,
            password: form.password,
            first_name: form.first_name,
            phone: form.phone,
            signupType: "join_group" as const,
            groupCode: form.groupCode.trim().toUpperCase(),
          };
    try {
      const response = await signup(payload);
      useAuthStore
        .getState()
        .setPendingOtpEmail(response.user?.email ?? form.email);
      router.replace("/(auth)/otp");
    } catch (cause) {
      const details = getApiErrorDetails(cause);
      const fieldErrors = Object.fromEntries(
        details
          .filter(
            (detail) =>
              detail.field &&
              detail.field !== "general" &&
              (detail.msg || detail.message),
          )
          .map((detail) => [
            detail.field as string,
            (detail.msg ?? detail.message) as string,
          ]),
      );
      setErrors({ ...fieldErrors, form: getApiErrorMessage(cause) });
    }
  }
  const field = (
    name: SignupField,
    label: string,
    placeholder: string,
    options: Record<string, unknown> = {},
  ) => (
    <FormField label={label} error={errors[name]}>
      <AppInput
        value={form[name]}
        onChangeText={(value) => update(name, value)}
        placeholder={placeholder}
        {...options}
      />
    </FormField>
  );
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
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
        >
          <VStack
            className="flex-1 gap-5 self-center"
            style={{ maxWidth: 480, width: "100%" }}
          >
        <VStack className="gap-1">
          <Text style={{ color: colors.textSecondary }}>Step {step} of 2</Text>
          <Heading size="3xl">Create your account</Heading>
          <Text style={{ color: colors.textSecondary }}>
            Join your savings community with a few secure details.
          </Text>
        </VStack>
        {step === 1 ? (
          <VStack className="gap-4">
            {field("first_name", "First name", "First name")}
            {field("last_name", "Last name", "Last name")}
            {field("phone", "Phone", "+254...")}
            {field("username", "Username", "Choose a username", {
              autoCapitalize: "none",
            })}
            {usernameStatus && (
              <Text
                style={{
                  color: usernameStatus.startsWith("Username unavailable")
                    ? colors.error
                    : usernameStatus.startsWith("Username available")
                      ? colors.success
                      : colors.textSecondary,
                }}
              >
                {usernameStatus}
              </Text>
            )}
            {field("email", "Email", "you@example.com", {
              keyboardType: "email-address",
              autoCapitalize: "none",
            })}
            {field("password", "Password", "At least 6 characters", {
              secureTextEntry: true,
            })}
            <AppButton
              title="Continue"
              onPress={() => {
                if (validateAccount()) setStep(2);
              }}
            />
          </VStack>
        ) : (
          <VStack className="gap-4">
            <Text bold>Choose how to join</Text>
            <VStack className="flex-row gap-3">
              <AppButton
                title="Join a group"
                variant={
                  form.signupType === "join_group" ? "default" : "outline"
                }
                onPress={() => {
                  update("signupType", "join_group");
                  setGroupStatus("");
                }}
              />
              <AppButton
                title="Create a group"
                variant={
                  form.signupType === "create_group" ? "default" : "outline"
                }
                onPress={() => {
                  update("signupType", "create_group");
                  setGroupStatus("");
                }}
              />
            </VStack>
            {form.signupType === "join_group" ? (
              <>
                {field("groupCode", "Group code", "GROUPCODE", {
                  autoCapitalize: "characters",
                })}
                <AppButton
                  title="Verify group code"
                  variant="outline"
                  onPress={verifyCode}
                />
                {groupStatus && (
                  <Text
                    style={{
                      color: groupStatus.startsWith("Valid")
                        ? colors.success
                        : colors.error,
                    }}
                  >
                    {groupStatus}
                  </Text>
                )}
              </>
            ) : (
              <>
                {field("groupName", "Group name", "Your group name")}
                {field(
                  "groupDescription",
                  "Description",
                  "What is this group saving for?",
                )}
                {field("monthlyTarget", "Monthly target", "KES amount", {
                  keyboardType: "number-pad",
                })}
                {field("city", "City", "Nairobi")}
                {field("country", "Country", "Kenya")}
              </>
            )}
            <Text style={{ color: colors.error }}>{errors.form}</Text>
            <AppButton
              title="Create account"
              loading={loading}
              onPress={submit}
            />
            <AppButton
              title="Back"
              variant="ghost"
              onPress={() => setStep(1)}
            />
          </VStack>
        )}
        <Link href="/(auth)/login">
          <Text style={{ color: colors.primary }} className="text-center">
            Already have an account? Sign in
          </Text>
        </Link>
          </VStack>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
