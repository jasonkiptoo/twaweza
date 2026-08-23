import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { Screen } from "@/components/layout/Screen";
import { ApplicationCard } from "@/components/credit-management/ApplicationCard";
import { AppEmptyState, AppErrorState } from "@/components/ui/AppStates";
import { AppSkeleton } from "@/components/ui/AppSkeleton";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { useLoanApplications } from "@/hooks/useLoanApplications";
import { AppButton } from "@/components/ui/AppButton";
import { useRouter } from "expo-router";

export default function ApplicationsScreen() {
  const router = useRouter();
  const { applications, loading, error, refresh } = useLoanApplications();
  return (
    <Screen>
      <View style={styles.container}>
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={refresh} />
          }
          contentContainerStyle={{ gap: 16, paddingBottom: 32 }}
        >
          <Heading size="3xl">My applications</Heading>
          {loading && !applications.length && <AppSkeleton height={130} />}
          {error && <AppErrorState message={error} onRetry={refresh} />}
          {!loading && !error && !applications.length && (
            <AppEmptyState
              title="No applications yet"
              message="Your submitted loan applications will appear here."
            />
          )}
          {applications.map((application) => (
            <ApplicationCard key={application.id} application={application} />
          ))}
        </ScrollView>
        <AppButton
          title="Request a loan"
          onPress={() => router.push("/(tabs)/credit-management/products")}
          style={styles.fab}
          accessibilityLabel="Request a loan"
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  fab: { position: "absolute", right: 16, bottom: 16, borderRadius: 24 },
});
