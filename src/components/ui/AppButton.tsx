import { Button, ButtonSpinner, ButtonText } from "./button";
import type { ComponentProps } from "react";

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
      <>
        {loading && <ButtonSpinner />}
        <ButtonText>{title}</ButtonText>
      </>
    </Button>
  );
}
