import { ShieldCheck } from "lucide-react-native";
import { Screen } from "@/components/layout/Screen";
import { AppEmptyState } from "@/components/ui/AppStates";

export default function AdminHomeScreen() {
  return (
    <Screen>
      <AppEmptyState
        title="Admin workspace"
        message="Approvals, lending, reports, and user management will be connected in the admin feature phase."
      />
    </Screen>
  );
}
