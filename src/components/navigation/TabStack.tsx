import { Stack } from "expo-router/stack";

import { useAppTheme } from "@/theme";

/** Shared stack foundation for each primary tab. */
export function TabStack() {
  const { colors } = useAppTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "none",
        contentStyle: { backgroundColor: colors.background },
      }}
    />
  );
}
