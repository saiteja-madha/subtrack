import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { DataProvider, useData } from "@/hooks/useData";
import { AppThemeProvider, useAppTheme } from "@/theme";

export default function RootLayout() {
  return (
    <DataProvider>
      <ThemeBridge />
    </DataProvider>
  );
}

function ThemeBridge() {
  const { settings } = useData();
  return (
    <AppThemeProvider appearance={settings.appearance}>
      <AppNavigator />
    </AppThemeProvider>
  );
}

function AppNavigator() {
  const { dark, colors } = useAppTheme();
  return (
    <>
      <StatusBar style={dark ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: "slide_from_right",
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="subscription/new" options={{ presentation: "modal" }} />
        <Stack.Screen name="subscription/[id]" />
        <Stack.Screen name="subscription/[id]/edit" />
      </Stack>
    </>
  );
}
