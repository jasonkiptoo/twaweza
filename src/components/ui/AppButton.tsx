import type { ComponentProps } from "react";
import { Button, ButtonSpinner, ButtonText } from "./button";

type AppButtonProps = ComponentProps<typeof Button> & {
  title: string;
  loading?: boolean;
};

export function AppButton({
  title,
  loading = false,
  isDisabled,
  ...props
}: AppButtonProps) {
  return (
    <Button {...props} isDisabled={loading || isDisabled}>
      {loading ? <ButtonSpinner /> : null}
      <ButtonText>{title}</ButtonText>
    </Button>
  );
}
