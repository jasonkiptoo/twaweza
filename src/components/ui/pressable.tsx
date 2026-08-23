import { Pressable as NativePressable } from "react-native";
import { createPressable } from "@gluestack-ui/core/pressable/creator";

export const Pressable = createPressable({ Root: NativePressable });
