import { Card } from "./card";
import type { ComponentProps } from "react";

export function AppCard(props: ComponentProps<typeof Card>) {
  return (
    <Card
      {...props}
      className={`rounded-xl border border-border bg-card p-4 ${props.className ?? ""}`}
    />
  );
}
