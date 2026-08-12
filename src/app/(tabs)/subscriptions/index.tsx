import React, { useMemo, useState } from "react";
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import { BottomSheet, Button, Column, Picker, Text as NativeText } from "@expo/ui";
import { useRouter } from "expo-router";
import { AppTextInput, SurfaceCard } from "@/components/ui";
import { AddSubscriptionButton } from "@/components/AddSubscriptionButton";
import { DataErrorState, LoadingState } from "@/components/DataState";
import { EmptyState } from "@/components/EmptyState";
import { Icon } from "@/components/Icon";
import { TabHeader } from "@/components/ScreenHeader";
import { Screen } from "@/components/Screen";
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
  const { status, error, subscriptions, categories, refresh, retry } = useData();
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
        <DataErrorState message={error} onRetry={() => void retry()} />
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
    </View>
  );
  return (
    <Screen scroll={false}>
      <TabHeader
        title="Subscriptions"
        subtitle={`${subscriptions.length} subscription${subscriptions.length === 1 ? "" : "s"} tracked`}
        right={<AddSubscriptionButton onPress={() => router.push("/subscription/new")} />}
      />
      <>
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
          contentInsetAdjustmentBehavior="automatic"
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
        />
        <BottomSheet
          isPresented={filtersOpen}
          onDismiss={() => setFiltersOpen(false)}
          showDragIndicator
          snapPoints={["half"]}
        >
          <Column spacing={18}>
            <NativeText textStyle={{ fontSize: 20, fontWeight: "700" }}>Filters</NativeText>
            <Column spacing={8}>
              <NativeText textStyle={{ fontSize: 14, fontWeight: "700" }}>Status</NativeText>
              <Picker
                selectedValue={statusFilter}
                onValueChange={(value) => setStatus(value as StatusFilter)}
              >
                {STATUSES.map((option) => (
                  <Picker.Item key={option.value} label={option.label} value={option.value} />
                ))}
              </Picker>
            </Column>
            <Column spacing={8}>
              <NativeText textStyle={{ fontSize: 14, fontWeight: "700" }}>Category</NativeText>
              <Picker
                selectedValue={category ?? "__all__"}
                onValueChange={(value) => setCategory(value === "__all__" ? null : value)}
              >
                <Picker.Item label="All categories" value="__all__" />
                {categories.map((item) => (
                  <Picker.Item key={item.id} label={item.name} value={item.id} />
                ))}
              </Picker>
            </Column>
            <Column spacing={8}>
              <NativeText textStyle={{ fontSize: 14, fontWeight: "700" }}>Sort by</NativeText>
              <Picker selectedValue={sort} onValueChange={(value) => setSort(value as SortKey)}>
                {SORTS.map((option) => (
                  <Picker.Item key={option.value} label={option.label} value={option.value} />
                ))}
              </Picker>
            </Column>
            <Button
              label="Clear filters"
              variant="text"
              onPress={() => {
                setStatus("all");
                setCategory(null);
                setSort("recent");
              }}
            />
          </Column>
        </BottomSheet>
      </>
    </Screen>
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
  rowCard: { paddingHorizontal: 1 },
  gap: { height: 10 },
});
