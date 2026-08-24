import { AppBadge } from "./AppBadge";
import { useTheme } from "@/hooks/useTheme";

const statusKind = {
  Approved: "success",
  Active: "success",
  Completed: "success",
  Rejected: "error",
  Defaulted: "error",
  "Pending Approval": "warning",
  Submitted: "info",
  Draft: "info",
  Disbursed: "info",
  "Written Off": "error",
} as const;
export function StatusBadge({ status }: { status?: string }) {
  const { colors } = useTheme();
  const normalized =
    status &&
    (Object.keys(statusKind) as Array<keyof typeof statusKind>).find(
      (value) => value.toLowerCase() === status.toLowerCase(),
    )
      ? (Object.keys(statusKind) as Array<keyof typeof statusKind>).find(
          (value) => value.toLowerCase() === status?.toLowerCase(),
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
