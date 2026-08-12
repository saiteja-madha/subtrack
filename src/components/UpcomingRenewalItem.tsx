import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { CategoryAvatar } from "@/components/CategoryAvatar";
import { minorToMajor } from "@/constants/currencies";
import { billingCycleLabel, type UpcomingRenewal } from "@/domain/billing";
import type { Category } from "@/domain/types";
import { useAppTheme } from "@/theme";
import { formatShortDate, isToday, isTomorrow } from "@/utils/dates";
import { formatCurrency } from "@/utils/money";
export function relativeDateLabel(date: Date): string {
  if (isToday(date)) return "Today";
  if (isTomorrow(date)) return "Tomorrow";
  return formatShortDate(date);
}
export function UpcomingRenewalItem({
  renewal,
  category,
}: {
  renewal: UpcomingRenewal;
  category?: Category | null;
}) {
  const { subscription, date } = renewal;
  const { colors } = useAppTheme();
  return (
    <View style={styles.row}>
      <CategoryAvatar category={category} name={subscription.name} size={42} />
      <View style={styles.flex}>
        <Text selectable style={[styles.name, { color: colors.text }]} numberOfLines={1}>
          {subscription.name}
        </Text>
        <Text selectable style={[styles.meta, { color: colors.textMuted }]} numberOfLines={1}>
          {relativeDateLabel(date)} ·{" "}
          {billingCycleLabel(subscription.billingInterval, subscription.billingUnit)}
        </Text>
      </View>
      <Text selectable style={[styles.amount, styles.tabular, { color: colors.text }]}>
        {formatCurrency(
          minorToMajor(subscription.priceMinor, subscription.currency),
          subscription.currency,
        )}
      </Text>
    </View>
  );
}
const styles = StyleSheet.create({
  row: { minHeight: 68, flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 11 },
  flex: { flex: 1 },
  name: { fontSize: 15, fontWeight: "700" },
  meta: { fontSize: 12, marginTop: 4 },
  amount: { fontSize: 15, fontWeight: "700" },
  tabular: { fontVariant: ["tabular-nums"] },
});
