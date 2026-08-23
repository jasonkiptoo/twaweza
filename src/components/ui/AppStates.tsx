import { Text } from "./text";
import { VStack } from "./vstack";
import { AppButton } from "./AppButton";

export function AppEmptyState({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <VStack className="items-center gap-2 py-8">
      <Text className="text-center font-semibold">{title}</Text>
      <Text className="text-center text-muted-foreground">{message}</Text>
    </VStack>
  );
}

export function AppErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <VStack className="items-center gap-3 py-8">
      <Text className="text-center text-error">{message}</Text>
      {onRetry && <AppButton title="Try again" onPress={onRetry} />}
    </VStack>
  );
}
