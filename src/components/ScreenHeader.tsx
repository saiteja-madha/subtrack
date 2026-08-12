import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { Icon } from "@/components/Icon";
import { useAppTheme } from "@/theme";

export function TabHeader({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}) {
  const { colors } = useAppTheme();
  return (
    <View style={styles.tab}>
      <View style={styles.flex}>
        <Text style={[styles.largeTitle, { color: colors.text }]}>{title}</Text>
        {subtitle ? (
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>{subtitle}</Text>
        ) : null}
      </View>
      {right ? <View style={styles.right}>{right}</View> : null}
    </View>
  );
}

export function ScreenHeader({
  title,
  showBack = false,
  right,
}: {
  title: string;
  showBack?: boolean;
  right?: React.ReactNode;
}) {
  const router = useRouter();
  const { colors } = useAppTheme();
  return (
    <View style={[styles.header, { borderBottomColor: colors.divider }]}>
      <View style={styles.side}>
        {showBack ? (
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.iconButton,
              { backgroundColor: colors.glass, opacity: pressed ? 0.65 : 1 },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Back"
            hitSlop={8}
          >
            <Icon name="chevron-back" size={22} color={colors.textSecondary} />
          </Pressable>
        ) : null}
      </View>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      <View style={[styles.side, styles.sideEnd]}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  tab: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 16,
  },
  flex: { flex: 1 },
  largeTitle: { fontSize: 32, lineHeight: 38, fontWeight: "800", letterSpacing: -1 },
  subtitle: { fontSize: 13, marginTop: 3 },
  right: { marginLeft: 14 },
  header: {
    height: 58,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  side: { width: 74, alignItems: "flex-start" },
  sideEnd: { alignItems: "flex-end" },
  title: { flex: 1, textAlign: "center", fontSize: 17, fontWeight: "700" },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
});
