import { Spinner } from "@/components/ui/spinner";
import { Text } from "./text";
import { VStack } from "./vstack";

export function LoadingState({ label = "Loading" }: { label?: string }) {
  return (
    <VStack className="items-center justify-center gap-3 py-8">
      <Spinner />
      <Text accessibilityLiveRegion="polite">{label}</Text>
    </VStack>
  );
}
