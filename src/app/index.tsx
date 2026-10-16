import { Stack } from "expo-router";

import { LandingPage } from "@/components/landing/LandingPage";

export default function IndexRoute() {
  return (
    <>
      <Stack.Screen
        options={{
          title: "SaveSmart | Save together, move forward together",
          headerShown: false,
        }}
      />
      <LandingPage />
    </>
  );
}
