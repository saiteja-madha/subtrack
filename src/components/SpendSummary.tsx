import React from "react";
import { StyleSheet, Text, View } from "react-native";
import type { SpendSummary as SpendSummaryType } from "@/domain/analytics";
import { elevation, useAppTheme } from "@/theme";
import { formatCurrency } from "@/utils/money";

export function SpendSummary({
  summary,
  preferredCurrency,
}: {
  summary: SpendSummaryType;
  preferredCurrency: string;
}) {
  const { colors } = useAppTheme();
  const orderedTotals = [...summary.totalsByCurrency].sort((a, b) => {
    if (a.currency === preferredCurrency) return -1;
    if (b.currency === preferredCurrency) return 1;
    return a.currency.localeCompare(b.currency);
  });
  const [primary, ...additional] = orderedTotals;
  return (
    <View style={[styles.card, elevation, { backgroundColor: colors.primary }]}>
      <View style={[styles.glow, { backgroundColor: colors.onPrimary, pointerEvents: "none" }]} />
      <Text style={[styles.eyebrow, { color: colors.onPrimary }]}>MONTHLY SPENDING</Text>
      <Text style={[styles.total, { color: colors.onPrimary }]}>
        {primary ? formatCurrency(primary.monthly, primary.currency) : "—"}
      </Text>
      <Text style={[styles.yearly, { color: colors.onPrimary }]}>
        {primary
          ? `≈ ${formatCurrency(primary.yearly, primary.currency)} per year`
          : "No active spending"}
      </Text>
      {additional.length ? (
        <Text style={[styles.additional, { color: colors.onPrimary }]}>
          Plus{" "}
          {additional.map((total) => formatCurrency(total.monthly, total.currency)).join(" · ")}{" "}
          monthly
        </Text>
      ) : null}
      <View style={[styles.stats, { borderTopColor: `${colors.onPrimary}30` }]}>
        <Stat value={summary.activeCount} label="Active" color={colors.onPrimary} />
        <Stat value={summary.dueInNext7Days} label="Due in 7 days" color={colors.onPrimary} />
      </View>
    </View>
  );
}

function Stat({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <View>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={[styles.statLabel, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: 22, minHeight: 196, borderRadius: 22, overflow: "hidden" },
  glow: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    right: -75,
    top: -90,
    opacity: 0.1,
  },
  eyebrow: { fontSize: 11, fontWeight: "800", letterSpacing: 1.2, opacity: 0.72 },
  total: { fontSize: 38, fontWeight: "800", letterSpacing: -1.5, marginTop: 8 },
  yearly: { fontSize: 13, opacity: 0.72, marginTop: 3 },
  additional: { fontSize: 12, opacity: 0.72, marginTop: 5 },
  stats: { flexDirection: "row", gap: 48, marginTop: 22, paddingTop: 16, borderTopWidth: 1 },
  statValue: { fontSize: 20, fontWeight: "800" },
  statLabel: { fontSize: 12, opacity: 0.72, marginTop: 2 },
});
