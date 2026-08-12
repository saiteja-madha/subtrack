import { DarkTheme, DefaultTheme, ThemeProvider } from "expo-router/react-navigation";
import { Stack } from "expo-router/stack";
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
  const baseTheme = dark ? DarkTheme : DefaultTheme;
  const navigationTheme = {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      primary: colors.primary,
      background: colors.background,
      card: colors.surface,
      text: colors.text,
      border: colors.divider,
      notification: colors.danger,
    },
  };

  return (
    <ThemeProvider value={navigationTheme}>
      <StatusBar style={dark ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: "slide_from_right",
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="subscription/new"
          options={{
            presentation: "formSheet",
            sheetGrabberVisible: true,
            sheetAllowedDetents: [1],
            contentStyle: { backgroundColor: colors.background },
          }}
        />
        <Stack.Screen name="subscription/[id]" />
        <Stack.Screen
          name="subscription/[id]/edit"
          options={{
            presentation: "formSheet",
            sheetGrabberVisible: true,
            sheetAllowedDetents: [1],
            contentStyle: { backgroundColor: colors.background },
          }}
        />
      </Stack>
    </ThemeProvider>
  );
}
