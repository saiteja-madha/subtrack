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
import { AppTextInput, Divider, SectionLabel, SurfaceCard } from "@/components/ui";
import { AddSubscriptionButton } from "@/components/AddSubscriptionButton";
import { DataErrorState, LoadingState } from "@/components/DataState";
import { EmptyState } from "@/components/EmptyState";
import { Icon } from "@/components/Icon";
import { TabHeader } from "@/components/ScreenHeader";
import { Screen } from "@/components/Screen";
import { SegmentChips } from "@/components/SegmentChips";
import { SubscriptionListItem } from "@/components/SubscriptionListItem";
import { getNextBillingDate } from "@/domain/billing";
import type { Subscription, SubscriptionStatus } from "@/domain/types";
import { useData } from "@/hooks/useData";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
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
  const { status, error, subscriptions, categories, refresh } = useData();
  const { isRefreshing, onRefresh } = usePullToRefresh(refresh);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatus] = useState<StatusFilter>("all");
  const [category, setCategory] = useState<string | null>(null);
  const [sort, setSort] = useState<SortKey>("recent");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const activeFilterCount =
    (statusFilter === "all" ? 0 : 1) + (category ? 1 : 0) + (sort === "recent" ? 0 : 1);
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
  if (status === "loading") {
    return (
      <Screen scroll={false} header={<TabHeader title="Subscriptions" />}>
        <LoadingState />
      </Screen>
    );
  }
  if (status === "error") {
    return (
      <Screen scroll={false} header={<TabHeader title="Subscriptions" />}>
        <DataErrorState message={error} />
      </Screen>
    );
  }
  if (subscriptions.length === 0) {
    return (
      <Screen
        refreshing={isRefreshing}
        onRefresh={onRefresh}
        contentContainerStyle={styles.emptyContent}
        header={
          <TabHeader
            title="Subscriptions"
            subtitle="0 subscriptions tracked"
            right={<AddSubscriptionButton onPress={() => router.push("/subscription/new")} />}
          />
        }
      >
        <EmptyState
          fill
          icon="search-outline"
          title="No subscriptions found"
          message="Add your first subscription to start tracking spending."
          actionLabel="Add subscription"
          onAction={() => router.push("/subscription/new")}
        />
      </Screen>
    );
  }
  const header = (
    <View style={styles.filters}>
      <View style={styles.searchRow}>
        <View
          style={[styles.search, { backgroundColor: colors.surface, borderColor: colors.divider }]}
        >
          <Icon name="search" size={19} color={colors.textMuted} />
          <AppTextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search subscriptions"
            accessibilityLabel="Search subscriptions"
            style={styles.searchInput}
          />
          {query ? (
            <Pressable
              onPress={() => setQuery("")}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Clear search"
            >
              <Icon name="close-circle" size={21} color={colors.textMuted} />
            </Pressable>
          ) : null}
        </View>
        <Pressable
          onPress={() => setFiltersOpen((open) => !open)}
          accessibilityRole="button"
          accessibilityLabel={
            activeFilterCount ? `Filters, ${activeFilterCount} active` : "Filters"
          }
          accessibilityState={{ expanded: filtersOpen }}
          style={({ pressed }) => [
            styles.filterButton,
            {
              backgroundColor: activeFilterCount ? colors.primarySoft : colors.surface,
              borderColor: activeFilterCount ? colors.primary : colors.divider,
              opacity: pressed ? 0.72 : 1,
            },
          ]}
        >
          <Icon name="options-outline" size={22} color={colors.primary} />
          {activeFilterCount ? (
            <View style={[styles.filterBadge, { backgroundColor: colors.primary }]}>
              <Text style={[styles.filterBadgeText, { color: colors.onPrimary }]}>
                {activeFilterCount}
              </Text>
            </View>
          ) : null}
        </Pressable>
      </View>
      {filtersOpen ? (
        <SurfaceCard style={styles.filterPanel}>
          <View style={styles.filterGroup}>
            <SectionLabel>Status</SectionLabel>
            <SegmentChips
              options={STATUSES}
              value={statusFilter}
              groupLabel="Status filter"
              onChange={(v) => setStatus((v as StatusFilter) ?? "all")}
            />
          </View>
          <View style={styles.filterGroup}>
            <SectionLabel>Category</SectionLabel>
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
          </View>
          <View style={styles.filterGroup}>
            <SectionLabel>Sort by</SectionLabel>
            <SegmentChips
              options={SORTS}
              value={sort}
              groupLabel="Sort subscriptions"
              onChange={(v) => setSort((v as SortKey) ?? "recent")}
            />
          </View>
        </SurfaceCard>
      ) : null}
    </View>
  );
  return (
    <Screen scroll={false}>
      <TabHeader
        title="Subscriptions"
        subtitle={`${subscriptions.length} subscription${subscriptions.length === 1 ? "" : "s"} tracked`}
        right={<AddSubscriptionButton onPress={() => router.push("/subscription/new")} />}
      />
      <FlatList
        data={data}
        keyExtractor={(i) => i.id}
        ListHeaderComponent={header}
        renderItem={({ item }: { item: Subscription }) => (
          <SurfaceCard style={styles.rowCard}>
            <SubscriptionListItem
              subscription={item}
              category={map.get(item.categoryId ?? "")}
              onPress={() =>
                router.push({ pathname: "/subscription/[id]", params: { id: item.id } })
              }
            />
          </SurfaceCard>
        )}
        ItemSeparatorComponent={() => <View style={styles.gap} />}
        ListEmptyComponent={
          <EmptyState
            icon="search-outline"
            title="No subscriptions found"
            message="Try adjusting your search or filters."
          />
        }
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
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
      accessibilityRole="radio"
      accessibilityLabel={label}
      accessibilityState={{ checked: selected }}
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
    paddingBottom: 32,
    width: "100%",
    maxWidth: 760,
    alignSelf: "center",
  },
  emptyContent: { paddingBottom: 32 },
  filters: { gap: 12, paddingBottom: 16 },
  searchRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  search: {
    flex: 1,
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
  filterButton: {
    width: 50,
    height: 50,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  filterBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  filterBadgeText: { fontSize: 11, fontWeight: "800" },
  filterPanel: { padding: 16, gap: 18 },
  filterGroup: { gap: 8 },
  categories: { gap: 8 },
  categoryChip: {
    paddingHorizontal: 13,
    minHeight: 44,
    justifyContent: "center",
    borderRadius: 999,
    borderWidth: 1,
  },
  rowCard: { paddingHorizontal: 1 },
  gap: { height: 10 },
});
