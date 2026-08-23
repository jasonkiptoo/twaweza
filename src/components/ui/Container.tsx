import type { PropsWithChildren } from "react";
import { View } from "react-native";
import { dimensions } from "@/theme";

export function Container({ children }: PropsWithChildren) {
  return (
    <View
      style={{
        width: "100%",
        maxWidth: dimensions.contentMaxWidth,
        alignSelf: "center",
      }}
    >
      {children}
    </View>
  );
}
