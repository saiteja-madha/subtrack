import React, { useMemo, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { AppButton, Divider, GlassSurface } from "@/components/ui";
import { CategoryAvatar } from "@/components/CategoryAvatar";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { EmptyState } from "@/components/EmptyState";
import { Screen } from "@/components/Screen";
import { ScreenHeader } from "@/components/ScreenHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { minorToMajor } from "@/constants/currencies";
import { effectiveReminderDays, reminderLabel } from "@/constants/reminders";
import { billingCycleLabel, getNextBillingDate } from "@/domain/billing";
import type { SubscriptionStatus } from "@/domain/types";
import { useData } from "@/hooks/useData";
import { useAppTheme } from "@/theme";
import { formatFullDate } from "@/utils/dates";
import { formatCurrency } from "@/utils/money";
export default function SubscriptionDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { subscriptions, categories, settings, setSubscriptionStatus, deleteSubscription } =
    useData();
  const { colors } = useAppTheme();
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const sub = useMemo(() => subscriptions.find((s) => s.id === id), [subscriptions, id]);
  const category = useMemo(
    () => (sub ? categories.find((c) => c.id === sub.categoryId) : undefined),
    [categories, sub],
  );
  if (!sub)
    return (
      <Screen header={<ScreenHeader title="Subscription" showBack />}>
        <View style={styles.center}>
          <EmptyState
            icon="alert-circle-outline"
            title="Subscription not found"
            message="It may have been deleted."
          />
        </View>
      </Screen>
    );
  const cycle = billingCycleLabel(sub.billingInterval, sub.billingUnit);
  const status = async (next: SubscriptionStatus) => {
    setBusy(true);
    try {
      await setSubscriptionStatus(sub.id, next);
    } finally {
      setBusy(false);
    }
  };
  const remove = async () => {
    setBusy(true);
    try {
      await deleteSubscription(sub.id);
      router.back();
    } catch (e) {
      Alert.alert("Delete failed", e instanceof Error ? e.message : "Please try again.");
      setBusy(false);
    }
  };
  return (
    <Screen
      header={
        <ScreenHeader
          title="Details"
          showBack
          right={
            <AppButton
              compact
              tone="ghost"
              label="Edit"
              disabled={busy}
              onPress={() =>
                router.push({ pathname: "/subscription/[id]/edit", params: { id: sub.id } })
              }
            />
          }
        />
      }
      contentContainerStyle={styles.bottom}
    >
      <View style={styles.content}>
        <View style={styles.hero}>
          <CategoryAvatar category={category} name={sub.name} size={76} />
          <Text style={[styles.name, { color: colors.text }]}>{sub.name}</Text>
          <StatusBadge status={sub.status} size="md" />
          <Text style={[styles.price, { color: colors.text }]}>
            {formatCurrency(minorToMajor(sub.priceMinor, sub.currency), sub.currency)}
            <Text style={[styles.cycle, { color: colors.textMuted }]}> / {cycle}</Text>
          </Text>
        </View>
        <GlassSurface style={styles.info}>
          <InfoRow label="Next payment" value={formatFullDate(getNextBillingDate(sub))} />
          <Divider />
          <InfoRow label="Billing cycle" value={cycle} />
          <Divider />
          <InfoRow label="Category" value={category?.name ?? "None"} />
          <Divider />
          <InfoRow
            label="First billed"
            value={sub.startDate ? formatFullDate(new Date(`${sub.startDate}T00:00:00`)) : "—"}
          />
          <Divider />
          <InfoRow
            label="Reminder"
            value={reminderLabel(
              effectiveReminderDays(sub.reminderDaysBefore, settings.defaultReminderDays),
            )}
          />
          {sub.notes ? (
            <>
              <Divider />
              <View>
                <Text style={[styles.infoLabel, { color: colors.textMuted }]}>Notes</Text>
                <Text style={[styles.notes, { color: colors.text }]}>{sub.notes}</Text>
              </View>
            </>
          ) : null}
        </GlassSurface>
        <View style={styles.actions}>
          {sub.status !== "cancelled" ? (
            <View style={styles.actionRow}>
              <AppButton
                style={styles.flex}
                tone="secondary"
                label={sub.status === "active" ? "Pause" : "Resume"}
                disabled={busy}
                onPress={() => void status(sub.status === "active" ? "paused" : "active")}
              />
              <AppButton
                style={styles.flex}
                tone="danger"
                label="Cancel"
                disabled={busy}
                onPress={() => void status("cancelled")}
              />
            </View>
          ) : (
            <AppButton
              tone="secondary"
              label="Reactivate"
              disabled={busy}
              onPress={() => void status("active")}
            />
          )}
          <AppButton
            tone="ghost"
            label="Delete subscription"
            disabled={busy}
            onPress={() => setConfirm(true)}
          />
        </View>
      </View>
      <ConfirmDialog
        isOpen={confirm}
        onOpenChange={setConfirm}
        title="Delete subscription?"
        message={`“${sub.name}” and its reminder will be permanently removed.`}
        confirmLabel="Delete"
        tone="danger"
        isLoading={busy}
        onConfirm={() => void remove()}
      />
    </Screen>
  );
}
function InfoRow({ label, value }: { label: string; value: string }) {
  const { colors } = useAppTheme();
  return (
    <View style={styles.infoRow}>
      <Text style={[styles.infoLabel, { color: colors.textMuted }]}>{label}</Text>
      <Text style={[styles.infoValue, { color: colors.text }]}>{value}</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center" },
  bottom: { paddingBottom: 44 },
  content: { padding: 20, gap: 24, width: "100%", maxWidth: 680, alignSelf: "center" },
  hero: { alignItems: "center", gap: 9, paddingVertical: 10 },
  name: { fontSize: 28, fontWeight: "800", textAlign: "center", letterSpacing: -0.5 },
  price: { fontSize: 30, fontWeight: "800", marginTop: 6 },
  cycle: { fontSize: 14, fontWeight: "500" },
  info: { padding: 19, gap: 15 },
  infoRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 16 },
  infoLabel: { fontSize: 13 },
  infoValue: { flex: 1, textAlign: "right", fontSize: 15, fontWeight: "600" },
  notes: { fontSize: 15, lineHeight: 21, marginTop: 5 },
  actions: { gap: 10 },
  actionRow: { flexDirection: "row", gap: 10 },
  flex: { flex: 1 },
});
