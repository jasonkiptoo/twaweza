import { useState } from "react";
import { ScrollView } from "react-native";
import { AppBadge } from "@/components/ui/AppBadge";
import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { AppEmptyState, AppErrorState } from "@/components/ui/AppStates";
import { AppSkeleton } from "@/components/ui/AppSkeleton";
import { AppToast } from "@/components/ui/AppToast";
import { Container } from "@/components/ui/Container";
import { FormField } from "@/components/ui/FormField";
import { AppInput } from "@/components/ui/AppInput";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { Screen } from "@/components/layout/Screen";
import { useTheme } from "@/hooks/useTheme";

export default function DesignSystemScreen() {
  const { mode, isDark, toggleTheme } = useTheme();
  const [value, setValue] = useState("");
  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 24, paddingBottom: 32 }}>
        <Container>
          <VStack className="gap-6">
            <VStack className="gap-1">
              <Heading size="3xl">Design system</Heading>
              <Text className="text-muted-foreground">
                SaveSmart shared components in {mode} mode.
              </Text>
            </VStack>
            <AppButton
              title={isDark ? "Switch to light mode" : "Switch to dark mode"}
              onPress={toggleTheme}
            />
            <FormField
              label="Example input"
              required
              helperText="Field feedback stays close to the control."
            >
              <AppInput
                value={value}
                onChangeText={setValue}
                placeholder="Type something"
              />
            </FormField>
            <AppCard>
              <VStack className="gap-3">
                <Heading size="lg">Financial card</Heading>
                <Text>
                  Components inherit semantic colors from the active theme.
                </Text>
                <AppBadge label="Active" />
              </VStack>
            </AppCard>
            <VStack className="gap-3">
              <AppToast
                kind="success"
                title="Success feedback"
                message="Your action was completed."
              />
              <AppSkeleton height={18} width="60%" />
              <AppEmptyState
                title="Nothing here yet"
                message="Empty states share one visual language."
              />
              <AppErrorState message="Something went wrong." />
            </VStack>
          </VStack>
        </Container>
      </ScrollView>
    </Screen>
  );
}
