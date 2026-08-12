import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { CategoryAvatar } from "@/components/CategoryAvatar";
import { StatusBadge } from "@/components/StatusBadge";
import { minorToMajor } from "@/constants/currencies";
import { billingCycleLabel, getNextBillingDate } from "@/domain/billing";
import type { Category, Subscription } from "@/domain/types";
import { useAppTheme } from "@/theme";
import { formatShortDate } from "@/utils/dates";
import { formatCurrency } from "@/utils/money";
export function SubscriptionListItem({
  subscription,
  category,
  onPress,
  showStatus = true,
}: {
  subscription: Subscription;
  category?: Category | null;
  onPress?: () => void;
  showStatus?: boolean;
}) {
  const { colors } = useAppTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, { opacity: pressed ? 0.65 : 1 }]}
      accessibilityRole="button"
      accessibilityLabel={subscription.name}
    >
      <CategoryAvatar category={category} name={subscription.name} size={44} />
      <View style={styles.flex}>
        <Text selectable style={[styles.name, { color: colors.text }]} numberOfLines={1}>
          {subscription.name}
        </Text>
        <Text selectable style={[styles.meta, { color: colors.textMuted }]} numberOfLines={1}>
          {billingCycleLabel(subscription.billingInterval, subscription.billingUnit)} ·{" "}
          {formatShortDate(getNextBillingDate(subscription))}
        </Text>
      </View>
      <View style={styles.end}>
        <Text selectable style={[styles.amount, styles.tabular, { color: colors.text }]}>
          {formatCurrency(
            minorToMajor(subscription.priceMinor, subscription.currency),
            subscription.currency,
          )}
        </Text>
        {showStatus ? <StatusBadge status={subscription.status} /> : null}
      </View>
    </Pressable>
  );
}
const styles = StyleSheet.create({
  row: {
    minHeight: 70,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  flex: { flex: 1 },
  name: { fontSize: 15, fontWeight: "700" },
  meta: { fontSize: 12, marginTop: 4 },
  end: { alignItems: "flex-end", gap: 5 },
  amount: { fontSize: 15, fontWeight: "700" },
  tabular: { fontVariant: ["tabular-nums"] },
});
