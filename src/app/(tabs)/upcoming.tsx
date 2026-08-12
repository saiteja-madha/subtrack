import React, { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { AppButton, Divider, GlassSurface } from "@/components/ui";
import { EmptyState } from "@/components/EmptyState";
import { Icon } from "@/components/Icon";
import { Screen } from "@/components/Screen";
import { TabHeader } from "@/components/ScreenHeader";
import { UpcomingRenewalItem } from "@/components/UpcomingRenewalItem";
import {
  groupUpcomingRenewals,
  UPCOMING_GROUP_LABELS,
  type UpcomingGroupKey,
} from "@/domain/billing";
import { useData } from "@/hooks/useData";
import { useAppTheme } from "@/theme";
const ORDER: UpcomingGroupKey[] = ["today", "tomorrow", "week", "month", "later"];
export default function UpcomingScreen() {
  const router = useRouter();
  const { isRefreshing, subscriptions, categories, refresh } = useData();
  const { colors } = useAppTheme();
  const map = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);
  const groups = useMemo(() => groupUpcomingRenewals(subscriptions), [subscriptions]);
  const visible = ORDER.filter((k) => groups[k].length);
  return (
    <Screen refreshing={isRefreshing} onRefresh={refresh} contentContainerStyle={styles.bottom}>
      <TabHeader
        title="Upcoming"
        subtitle="Every renewal, right on time"
        right={
          <AppButton
            compact
            tone="secondary"
            icon={<Icon name="add" size={20} color={colors.primary} />}
            onPress={() => router.push("/subscription/new")}
          />
        }
      />
      {!visible.length ? (
        <View style={styles.center}>
          <EmptyState
            icon="calendar-outline"
            title="Nothing due soon"
            message="Upcoming renewals will appear here as their billing dates approach."
          />
        </View>
      ) : (
        <View style={styles.content}>
          {visible.map((key) => (
            <View key={key} style={styles.group}>
              <Text style={[styles.title, { color: colors.text }]}>
                {UPCOMING_GROUP_LABELS[key]}
              </Text>
              <GlassSurface style={styles.card}>
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
                    >
                      <UpcomingRenewalItem
                        renewal={r}
                        category={map.get(r.subscription.categoryId ?? "")}
                      />
                    </Pressable>
                  </React.Fragment>
                ))}
              </GlassSurface>
            </View>
          ))}
        </View>
      )}
    </Screen>
  );
}
const styles = StyleSheet.create({
  bottom: { paddingBottom: 110 },
  center: { flex: 1, justifyContent: "center" },
  content: { paddingHorizontal: 20, gap: 24, width: "100%", maxWidth: 760, alignSelf: "center" },
  group: { gap: 9 },
  title: { fontSize: 18, fontWeight: "800", paddingHorizontal: 3 },
  card: { paddingHorizontal: 15 },
});
