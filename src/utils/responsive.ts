import { Dimensions } from "react-native";

export const BREAKPOINTS = { small: 360, tablet: 768, large: 1024 } as const;

export function getWindowMetrics() {
  const { width, height } = Dimensions.get("window");
  return {
    width,
    height,
    isSmallDevice: width < BREAKPOINTS.small,
    isTablet: width >= BREAKPOINTS.tablet,
    isLargeDevice: width >= BREAKPOINTS.large,
  };
}

export function responsiveValue<T>(small: T, regular: T, large?: T): T {
  const { isSmallDevice, isLargeDevice } = getWindowMetrics();
  if (isSmallDevice) return small;
  if (isLargeDevice && large !== undefined) return large;
  return regular;
}
