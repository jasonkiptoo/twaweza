import { ApplicationCard } from "@/components/credit-management/ApplicationCard";
import { Screen } from "@/components/layout/Screen";
import { AppButton } from "@/components/ui/AppButton";
import { AppSkeleton } from "@/components/ui/AppSkeleton";
import { AppEmptyState, AppErrorState } from "@/components/ui/AppStates";
import { Heading } from "@/components/ui/heading";
import { useLoanApplications } from "@/hooks/useLoanApplications";
import { useRouter } from "expo-router";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";

export default function ApplicationsScreen() {
  const router = useRouter();
  const { applications, loading, error, refresh, hasMore, loadMore } =
    useLoanApplications();
  return (
    <Screen>
      <View style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
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
          {hasMore && (
            <AppButton
              title="Load more applications"
              loading={loading}
              onPress={loadMore}
              variant="outline"
            />
          )}
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
