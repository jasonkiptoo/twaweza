import { useTheme } from "@/hooks/useTheme";
import { AppBadge } from "./AppBadge";

const statusKind = {
  Approved: "success",
  Active: "success",
  Paid: "success",
  Completed: "success",
  Rejected: "error",
  Defaulted: "error",
  Overdue: "error",
  "Pending Approval": "warning",
  Pending: "warning",
  "Partially Paid": "warning",
  Submitted: "info",
  Draft: "info",
  Disbursed: "info",
  "Written Off": "error",
} as const;
export function StatusBadge({ status }: { status?: string }) {
  const { colors } = useTheme();
  const normalized = status
    ? (Object.keys(statusKind) as Array<keyof typeof statusKind>).find(
        (value) =>
          status.toLowerCase() === value.toLowerCase() ||
          status.toLowerCase().startsWith(`${value.toLowerCase()} `),
      )
    : undefined;
  const kind = normalized ? statusKind[normalized] : "info";
  return (
    <AppBadge
      label={status ?? "Unknown"}
      style={{ backgroundColor: colors[kind] }}
    />
  );
}
