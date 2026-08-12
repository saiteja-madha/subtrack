import React from "react";
import { StyleSheet, Text, View } from "react-native";
import type { SubscriptionStatus } from "@/domain/types";
import { useAppTheme } from "@/theme";
const labels: Record<SubscriptionStatus, string> = {
  active: "Active",
  paused: "Paused",
  cancelled: "Cancelled",
};
export function StatusBadge({
  status,
  size = "sm",
}: {
  status: SubscriptionStatus;
  size?: "sm" | "md" | "lg";
}) {
  const { colors } = useAppTheme();
  const fg =
    status === "active" ? colors.success : status === "paused" ? colors.warning : colors.textMuted;
  const bg =
    status === "active"
      ? colors.successSoft
      : status === "paused"
        ? colors.warningSoft
        : colors.surfaceMuted;
  return (
    <View style={[styles.badge, size !== "sm" && styles.large, { backgroundColor: bg }]}>
      <Text style={[styles.label, size !== "sm" && styles.largeLabel, { color: fg }]}>
        {labels[status]}
      </Text>
    </View>
  );
}
const styles = StyleSheet.create({
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  large: { paddingHorizontal: 11, paddingVertical: 5 },
  label: { fontSize: 10, fontWeight: "700" },
  largeLabel: { fontSize: 12 },
});
