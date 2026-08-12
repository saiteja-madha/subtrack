import React from "react";
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";
import { AppButton, GlassSurface } from "@/components/ui";
import { Icon, type IconName } from "@/components/Icon";
import { useAppTheme } from "@/theme";
export function EmptyState({
  icon,
  title,
  message,
  actionLabel,
  onAction,
  style,
}: {
  icon: IconName;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  const { colors } = useAppTheme();
  return (
    <View style={[styles.outer, style]}>
      <GlassSurface style={styles.card}>
        <View style={[styles.icon, { backgroundColor: colors.primarySoft }]}>
          <Icon name={icon} size={30} color={colors.primary} />
        </View>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        {message ? (
          <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text>
        ) : null}
        {actionLabel && onAction ? (
          <AppButton label={actionLabel} onPress={onAction} style={styles.action} />
        ) : null}
      </GlassSurface>
    </View>
  );
}
const styles = StyleSheet.create({
  outer: { padding: 24, alignItems: "center", justifyContent: "center" },
  card: {
    width: "100%",
    maxWidth: 480,
    alignItems: "center",
    paddingHorizontal: 28,
    paddingVertical: 34,
  },
  icon: {
    width: 66,
    height: 66,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  title: { fontSize: 20, fontWeight: "800", textAlign: "center" },
  message: { fontSize: 14, lineHeight: 21, textAlign: "center", marginTop: 8 },
  action: { marginTop: 22 },
});
