import { Screen } from "@/components/layout/Screen";
import { AppEmptyState } from "@/components/ui/AppStates";
export default function AdminReportsScreen() {
  return (
    <Screen>
      <AppEmptyState
        title="Reports"
        message="Portfolio and operational reports will be connected in the admin feature phase."
      />
    </Screen>
  );
}
