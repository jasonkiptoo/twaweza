import { Text } from "./text";
import { VStack } from "./vstack";
import { useTheme } from "@/hooks/useTheme";

export function FormField({
  label,
  error,
  helperText,
  required,
  children,
}: {
  label: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  const { colors } = useTheme();
  return (
    <VStack className="gap-2">
      <Text bold>
        {label}
        {required ? " *" : ""}
      </Text>
      {children}
      {error ? (
        <Text style={{ color: colors.error }}>{error}</Text>
      ) : helperText ? (
        <Text size="sm" className="text-muted-foreground">
          {helperText}
        </Text>
      ) : null}
    </VStack>
  );
}
