import React from "react";
import type { LucideProps } from "lucide-react-native";
import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Home,
  PiggyBank,
  User,
  Wallet,
} from "lucide-react-native";
import { dimensions } from "@/theme";

export const iconSizes = dimensions.icon;
export const icons = {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Home,
  PiggyBank,
  User,
  Wallet,
};
export type AppIcon = keyof typeof icons;
export function Icon({
  name,
  size = iconSizes.md,
  color,
  ...props
}: LucideProps & { name: AppIcon }) {
  const Component = icons[name];
  return React.createElement(Component, {
    size,
    color,
    strokeWidth: 2,
    ...props,
  });
}
