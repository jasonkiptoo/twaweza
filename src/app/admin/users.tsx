import { Screen } from "@/components/layout/Screen";
import { AppEmptyState } from "@/components/ui/AppStates";
export default function AdminUsersScreen() {
  return (
    <Screen>
      <AppEmptyState
        title="User management"
        message="User management will be connected in the admin feature phase."
      />
    </Screen>
  );
}
