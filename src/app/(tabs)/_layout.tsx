import { NativeTabs } from "expo-router/unstable-native-tabs";

import { useAppTheme } from "@/theme";

export default function TabsLayout() {
  const { colors, dark } = useAppTheme();

  return (
    <NativeTabs
      tintColor={colors.primary}
      iconColor={{ default: colors.textMuted, selected: colors.primary }}
      labelStyle={{
        default: { color: colors.textMuted, fontSize: 11, fontWeight: "600" },
        selected: { color: colors.primary, fontSize: 11, fontWeight: "600" },
      }}
      backgroundColor={process.env.EXPO_OS === "android" ? colors.surface : undefined}
      indicatorColor={colors.primarySoft}
      rippleColor={colors.primarySoft}
      labelVisibilityMode="labeled"
      disableTransparentOnScrollEdge
      minimizeBehavior="never"
      unstable_nativeProps={{ colorScheme: dark ? "dark" : "light" }}
    >
      <NativeTabs.Trigger name="(home)" contentStyle={{ backgroundColor: colors.background }}>
        <NativeTabs.Trigger.Icon
          sf={{ default: "house", selected: "house.fill" }}
          md={{ default: "home", selected: "home_filled" }}
        />
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger
        name="subscriptions"
        contentStyle={{ backgroundColor: colors.background }}
      >
        <NativeTabs.Trigger.Icon
          sf={{ default: "list.bullet.rectangle", selected: "list.bullet.rectangle.fill" }}
          md="list_alt"
        />
        <NativeTabs.Trigger.Label>Subscriptions</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="upcoming" contentStyle={{ backgroundColor: colors.background }}>
        <NativeTabs.Trigger.Icon sf="calendar" md="calendar_month" />
        <NativeTabs.Trigger.Label>Upcoming</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="settings" contentStyle={{ backgroundColor: colors.background }}>
        <NativeTabs.Trigger.Icon
          sf={{ default: "gearshape", selected: "gearshape.fill" }}
          md="settings"
        />
        <NativeTabs.Trigger.Label>Settings</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
