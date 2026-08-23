import React from "react";
import { View, ViewProps } from "react-native";
import { useColorScheme } from "nativewind";

import { config } from "./config";

export type ModeType = "light" | "dark" | "system";

export function GluestackUIProvider({
  mode = "light",
  ...props
}: {
  mode?: ModeType;
  children?: React.ReactNode;
  style?: ViewProps["style"];
}) {
  const { colorScheme } = useColorScheme();
  const activeColorScheme = mode === "system" ? colorScheme : mode;

  return (
    <View
      style={[
        config[activeColorScheme!],
        { flex: 1, height: "100%", width: "100%" },
        props.style,
      ]}
    >
      {props.children}
    </View>
  );
}
