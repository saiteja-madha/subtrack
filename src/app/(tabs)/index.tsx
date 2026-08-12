import { EmptyState } from "@/components/EmptyState";
import { Icon } from "@/components/Icon";
import { Screen } from "@/components/Screen";
import { TabHeader } from "@/components/ScreenHeader";
import { SpendSummary } from "@/components/SpendSummary";
import { SubscriptionListItem } from "@/components/SubscriptionListItem";
import { AppButton, Divider, GlassSurface } from "@/components/ui";
import { UpcomingRenewalItem } from "@/components/UpcomingRenewalItem";
import { getSpendSummary } from "@/domain/analytics";
import type { Subscription } from "@/domain/types";
import { useData } from "@/hooks/useData";
import { useAppTheme } from "@/theme";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
export default function HomeScreen() {
  const router = useRouter();
  const { status, isRefreshing, subscriptions, categories, settings, refresh } = useData();
  const { colors } = useAppTheme();
  const openNew = () => router.push("/subscription/new");
  if (status === "loading")
    return (
      <Screen scroll={false}>
        <View style={styles.center}>
          <Text style={{ color: colors.textMuted }}>Loading your subscriptions…</Text>
        </View>
      </Screen>
    );
  const map = new Map(categories.map((c) => [c.id, c]));
  const summary = getSpendSummary(subscriptions);
  const recent = subscriptions.slice(0, 5);
  const due = summary.upcoming.slice(0, 5);
  const details = (s: Subscription) =>
    router.push({ pathname: "/subscription/[id]", params: { id: s.id } });
  return (
    <Screen refreshing={isRefreshing} onRefresh={refresh} contentContainerStyle={styles.bottom}>
      <TabHeader
        title="SubTrack"
        subtitle={`${subscriptions.length} subscription${subscriptions.length === 1 ? "" : "s"} tracked`}
        right={
          <AppButton
            compact
            icon={<Icon name="add" size={21} color={colors.onPrimary} />}
            onPress={openNew}
          />
        }
      />
      {subscriptions.length === 0 ? (
        <View style={styles.center}>
          <EmptyState
            icon="card-outline"
            title="Your spending, made clear"
            message="Add your first subscription to see totals, renewal dates, and reminders in one calm place."
            actionLabel="Add subscription"
            onAction={openNew}
          />
        </View>
      ) : (
        <View style={styles.content}>
          <SpendSummary summary={summary} preferredCurrency={settings.currency} />
          {due.length ? (
            <Group title="Due soon" detail="Next 7 days">
              <GlassSurface style={styles.list}>
                {due.map((r, i) => (
                  <React.Fragment key={r.subscription.id}>
                    {i ? <Divider inset={4} /> : null}
                    <UpcomingRenewalItem
                      renewal={r}
                      category={map.get(r.subscription.categoryId ?? "")}
                    />
                  </React.Fragment>
                ))}
              </GlassSurface>
            </Group>
          ) : null}
          {recent.length ? (
            <Group title="Recent">
              <GlassSurface style={styles.list}>
                {recent.map((s, i) => (
                  <React.Fragment key={s.id}>
                    {i ? <Divider inset={10} /> : null}
                    <SubscriptionListItem
                      subscription={s}
                      category={map.get(s.categoryId ?? "")}
                      onPress={() => details(s)}
                    />
                  </React.Fragment>
                ))}
              </GlassSurface>
            </Group>
          ) : null}
          <AppButton tone="secondary" label="Add another subscription" onPress={openNew} />
        </View>
      )}
    </Screen>
  );
}
function Group({
  title,
  detail,
  children,
}: {
  title: string;
  detail?: string;
  children: React.ReactNode;
}) {
  const { colors } = useAppTheme();
  return (
    <View style={styles.group}>
      <View style={styles.groupHead}>
        <Text style={[styles.groupTitle, { color: colors.text }]}>{title}</Text>
        {detail ? <Text style={[styles.detail, { color: colors.primary }]}>{detail}</Text> : null}
      </View>
      {children}
    </View>
  );
}
const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  bottom: { paddingBottom: 110 },
  content: { gap: 24, paddingHorizontal: 20, width: "100%", maxWidth: 760, alignSelf: "center" },
  group: { gap: 9 },
  groupHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 3,
  },
  groupTitle: { fontSize: 18, fontWeight: "800" },
  detail: { fontSize: 12, fontWeight: "700" },
  list: { paddingHorizontal: 6 },
});
