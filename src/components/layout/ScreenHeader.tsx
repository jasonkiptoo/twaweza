import type { PropsWithChildren } from "react";
import { View } from "react-native";
import { Heading } from "@/components/ui/heading";

export function ScreenHeader({
  title,
  children,
}: PropsWithChildren<{ title: string }>) {
  return (
    <View className="flex-row items-center justify-between pb-4">
      <Heading size="xl">{title}</Heading>
      {children}
    </View>
  );
}
