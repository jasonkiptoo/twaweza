import { Input, InputField } from "./input";
import type { ComponentProps } from "react";

export function AppInput(props: ComponentProps<typeof InputField>) {
  return (
    <Input className="rounded-lg border-border bg-card">
      <InputField {...props} />
    </Input>
  );
}
