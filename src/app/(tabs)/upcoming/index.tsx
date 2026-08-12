import React, { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { AddSubscriptionButton } from "@/components/AddSubscriptionButton";
import { DataErrorState, LoadingState } from "@/components/DataState";
import { Divider, SurfaceCard } from "@/components/ui";
import { EmptyState } from "@/components/EmptyState";
import { Screen } from "@/components/Screen";
import { TabHeader } from "@/components/ScreenHeader";
import { UpcomingRenewalItem } from "@/components/UpcomingRenewalItem";
import {
  groupUpcomingRenewals,
  UPCOMING_GROUP_LABELS,
  type UpcomingGroupKey,
} from "@/domain/billing";
import { useData } from "@/hooks/useData";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import { useAppTheme } from "@/theme";
const ORDER: UpcomingGroupKey[] = ["today", "tomorrow", "week", "month", "later"];
export default function UpcomingScreen() {
  const router = useRouter();
  const { status, error, subscriptions, categories, refresh } = useData();
  const { isRefreshing, onRefresh } = usePullToRefresh(refresh);
  const { colors } = useAppTheme();
  const map = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);
  const groups = useMemo(() => groupUpcomingRenewals(subscriptions), [subscriptions]);
  const visible = ORDER.filter((k) => groups[k].length);
  if (status === "loading") {
    return (
      <Screen scroll={false} header={<TabHeader title="Upcoming" />}>
        <LoadingState />
      </Screen>
    );
  }
  if (status === "error") {
    return (
      <Screen scroll={false} header={<TabHeader title="Upcoming" />}>
        <DataErrorState message={error} />
      </Screen>
    );
  }
  return (
    <Screen
      refreshing={isRefreshing}
      onRefresh={onRefresh}
      contentContainerStyle={styles.bottom}
      header={
        <TabHeader
          title="Upcoming"
          right={<AddSubscriptionButton onPress={() => router.push("/subscription/new")} />}
        />
      }
    >
      {!visible.length ? (
        <EmptyState
          fill
          icon="calendar-outline"
          title="Nothing due soon"
          message="Upcoming renewals will appear here as their billing dates approach."
          actionLabel={subscriptions.length === 0 ? "Add subscription" : undefined}
          onAction={subscriptions.length === 0 ? () => router.push("/subscription/new") : undefined}
        />
      ) : (
        <View style={styles.content}>
          {visible.map((key) => (
            <View key={key} style={styles.group}>
              <Text style={[styles.title, { color: colors.text }]}>
                {UPCOMING_GROUP_LABELS[key]}
              </Text>
              <SurfaceCard style={styles.card}>
                {groups[key].map((r, i) => (
                  <React.Fragment key={r.subscription.id}>
                    {i ? <Divider /> : null}
                    <Pressable
                      onPress={() =>
                        router.push({
                          pathname: "/subscription/[id]",
                          params: { id: r.subscription.id },
                        })
                      }
                      style={({ pressed }) => ({ opacity: pressed ? 0.65 : 1 })}
                      accessibilityRole="button"
                      accessibilityLabel={`View ${r.subscription.name} subscription`}
                    >
                      <UpcomingRenewalItem
                        renewal={r}
                        category={map.get(r.subscription.categoryId ?? "")}
                      />
                    </Pressable>
                  </React.Fragment>
                ))}
              </SurfaceCard>
            </View>
          ))}
        </View>
      )}
    </Screen>
  );
}
const styles = StyleSheet.create({
  bottom: { paddingBottom: 32 },
  content: { paddingHorizontal: 20, gap: 24, width: "100%", maxWidth: 760, alignSelf: "center" },
  group: { gap: 9 },
  title: { fontSize: 18, fontWeight: "800", paddingHorizontal: 3 },
  card: { paddingHorizontal: 15 },
});
