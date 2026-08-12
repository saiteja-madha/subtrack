import React from "react";
import { Platform, type ColorValue } from "react-native";
import { Tabs } from "expo-router";
import { Icon, type IconName } from "@/components/Icon";
import { useAppTheme } from "@/theme";
export default function TabsLayout() {
  const { colors } = useAppTheme();
  const icon =
    (filled: IconName, outline: IconName) =>
    ({ color, size, focused }: { color: ColorValue; size: number; focused: boolean }) => (
      <Icon name={focused ? filled : outline} size={size} color={color} />
    );
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
        tabBarStyle: {
          position: "absolute",
          height: Platform.OS === "ios" ? 86 : 68,
          paddingTop: 8,
          backgroundColor: colors.glass,
          borderTopColor: colors.glassBorder,
          borderTopWidth: 1,
          ...(Platform.OS === "web" ? { backdropFilter: "blur(22px)" } : {}),
        },
        sceneStyle: { backgroundColor: "transparent" },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: "Home", tabBarIcon: icon("home", "home-outline") }}
      />
      <Tabs.Screen
        name="subscriptions"
        options={{ title: "Subscriptions", tabBarIcon: icon("list", "list-outline") }}
      />
      <Tabs.Screen
        name="upcoming"
        options={{ title: "Upcoming", tabBarIcon: icon("calendar", "calendar-outline") }}
      />
      <Tabs.Screen
        name="settings"
        options={{ title: "Settings", tabBarIcon: icon("settings", "settings-outline") }}
      />
    </Tabs>
  );
}
