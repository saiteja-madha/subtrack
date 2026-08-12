import { Tabs } from "expo-router";
import { BlurView } from "expo-blur";

import { Icon, type IconName } from "@/components/Icon";
import { useAppTheme } from "@/theme";

const TAB_ICONS: Record<string, { default: IconName; selected: IconName }> = {
  "(home)": { default: "home-outline", selected: "home" },
  subscriptions: { default: "list-outline", selected: "list" },
  upcoming: { default: "calendar-outline", selected: "calendar" },
  settings: { default: "settings-outline", selected: "settings" },
};

export default function WebTabsLayout() {
  const { colors, dark } = useAppTheme();

  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        sceneStyle: { backgroundColor: colors.background },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
        tabBarItemStyle: { minHeight: 54 },
        tabBarStyle: {
          position: "absolute",
          right: 16,
          bottom: 12,
          left: 16,
          height: 66,
          paddingTop: 7,
          paddingBottom: 7,
          borderTopWidth: 0,
          borderWidth: 1,
          borderColor: colors.glassBorder,
          borderRadius: 28,
          backgroundColor: "transparent",
          overflow: "hidden",
        },
        tabBarBackground: () => (
          <BlurView
            intensity={38}
            tint={dark ? "dark" : "light"}
            style={{ flex: 1, backgroundColor: colors.glass }}
          />
        ),
        tabBarIcon: ({ color, focused, size }) => {
          const icons = TAB_ICONS[route.name] ?? TAB_ICONS["(home)"];
          return <Icon name={focused ? icons.selected : icons.default} color={color} size={size} />;
        },
      })}
    >
      <Tabs.Screen name="(home)" options={{ title: "Home" }} />
      <Tabs.Screen name="subscriptions" options={{ title: "Subscriptions" }} />
      <Tabs.Screen name="upcoming" options={{ title: "Upcoming" }} />
      <Tabs.Screen name="settings" options={{ title: "Settings" }} />
    </Tabs>
  );
}
