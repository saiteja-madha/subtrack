import React, { useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { AppButton, AppTextInput, Divider, GlassSurface, SectionLabel } from "@/components/ui";
import { EmptyState } from "@/components/EmptyState";
import { Icon } from "@/components/Icon";
import { TabHeader } from "@/components/ScreenHeader";
import { Screen } from "@/components/Screen";
import { SegmentChips } from "@/components/SegmentChips";
import { SubscriptionListItem } from "@/components/SubscriptionListItem";
import { getNextBillingDate } from "@/domain/billing";
import type { Subscription, SubscriptionStatus } from "@/domain/types";
import { useData } from "@/hooks/useData";
import { useAppTheme } from "@/theme";
type StatusFilter = "all" | SubscriptionStatus;
type SortKey = "recent" | "name" | "price" | "next";
const STATUSES = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "paused", label: "Paused" },
  { value: "cancelled", label: "Cancelled" },
];
const SORTS = [
  { value: "recent", label: "Recent" },
  { value: "name", label: "Name" },
  { value: "price", label: "Price" },
  { value: "next", label: "Next bill" },
];
export default function SubscriptionsScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { isRefreshing, subscriptions, categories, refresh } = useData();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatus] = useState<StatusFilter>("all");
  const [category, setCategory] = useState<string | null>(null);
  const [sort, setSort] = useState<SortKey>("recent");
  const map = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);
  const data = useMemo(() => {
    const q = query.trim().toLowerCase();
    const rows = subscriptions.filter(
      (s) =>
        (statusFilter === "all" || s.status === statusFilter) &&
        (!category || s.categoryId === category) &&
        (!q || `${s.name} ${s.notes ?? ""}`.toLowerCase().includes(q)),
    );
    return [...rows].sort((a, b) =>
      sort === "name"
        ? a.name.localeCompare(b.name)
        : sort === "price"
          ? b.priceMinor - a.priceMinor
          : sort === "next"
            ? getNextBillingDate(a).getTime() - getNextBillingDate(b).getTime()
            : 0,
    );
  }, [subscriptions, query, statusFilter, category, sort]);
  const header = (
    <View style={styles.filters}>
      <View
        style={[styles.search, { backgroundColor: colors.surface, borderColor: colors.divider }]}
      >
        <Icon name="search" size={19} color={colors.textMuted} />
        <AppTextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search subscriptions"
          style={styles.searchInput}
        />
        {query ? (
          <Pressable onPress={() => setQuery("")} hitSlop={8}>
            <Icon name="close-circle" size={19} color={colors.textMuted} />
          </Pressable>
        ) : null}
      </View>
      <View style={styles.filterGroup}>
        <SectionLabel>Status</SectionLabel>
        <SegmentChips
          options={STATUSES}
          value={statusFilter}
          onChange={(v) => setStatus((v as StatusFilter) ?? "all")}
        />
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categories}
      >
        <CategoryChip
          label="All categories"
          selected={!category}
          onPress={() => setCategory(null)}
        />
        {categories.map((c) => (
          <CategoryChip
            key={c.id}
            label={c.name}
            selected={category === c.id}
            onPress={() => setCategory(category === c.id ? null : c.id)}
          />
        ))}
      </ScrollView>
      <View style={styles.filterGroup}>
        <SectionLabel>Sort by</SectionLabel>
        <SegmentChips
          options={SORTS}
          value={sort}
          onChange={(v) => setSort((v as SortKey) ?? "recent")}
        />
      </View>
    </View>
  );
  return (
    <Screen scroll={false}>
      <TabHeader
        title="Subscriptions"
        subtitle={`${subscriptions.length} subscription${subscriptions.length === 1 ? "" : "s"} tracked`}
        right={
          <AppButton
            compact
            icon={<Icon name="add" size={19} color={colors.onPrimary} />}
            onPress={() => router.push("/subscription/new")}
          />
        }
      />
      <FlatList
        data={data}
        keyExtractor={(i) => i.id}
        ListHeaderComponent={header}
        renderItem={({ item }: { item: Subscription }) => (
          <GlassSurface style={styles.rowCard}>
            <SubscriptionListItem
              subscription={item}
              category={map.get(item.categoryId ?? "")}
              onPress={() =>
                router.push({ pathname: "/subscription/[id]", params: { id: item.id } })
              }
            />
          </GlassSurface>
        )}
        ItemSeparatorComponent={() => <View style={styles.gap} />}
        ListEmptyComponent={
          <EmptyState
            icon="search-outline"
            title="No subscriptions found"
            message={
              subscriptions.length
                ? "Try adjusting your search or filters."
                : "Add your first subscription to start tracking spending."
            }
            actionLabel={subscriptions.length ? undefined : "Add subscription"}
            onAction={subscriptions.length ? undefined : () => router.push("/subscription/new")}
          />
        }
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => void refresh()}
            tintColor={colors.primary}
          />
        }
      />
    </Screen>
  );
}
function CategoryChip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  const { colors } = useAppTheme();
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.categoryChip,
        {
          backgroundColor: selected ? colors.primarySoft : colors.surfaceMuted,
          borderColor: selected ? colors.primary : colors.divider,
        },
      ]}
    >
      <Text
        style={{
          color: selected ? colors.primary : colors.textSecondary,
          fontSize: 13,
          fontWeight: "600",
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
const styles = StyleSheet.create({
  list: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 110,
    width: "100%",
    maxWidth: 760,
    alignSelf: "center",
  },
  filters: { gap: 18, paddingBottom: 16 },
  search: {
    minHeight: 50,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    gap: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  searchInput: {
    flex: 1,
    minHeight: 48,
    paddingHorizontal: 0,
    backgroundColor: "transparent",
    borderWidth: 0,
  },
  filterGroup: { gap: 8 },
  categories: { gap: 8 },
  categoryChip: {
    paddingHorizontal: 13,
    minHeight: 34,
    justifyContent: "center",
    borderRadius: 999,
    borderWidth: 1,
  },
  rowCard: { paddingHorizontal: 1 },
  gap: { height: 10 },
});
