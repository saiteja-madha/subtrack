import { StyleSheet, Text, View } from "react-native";

import { EmptyState } from "@/components/EmptyState";
import { SurfaceCard } from "@/components/ui";
import { useAppTheme } from "@/theme";

export function LoadingState() {
  const { colors } = useAppTheme();

  return (
    <View
      style={styles.loading}
      accessibilityRole="progressbar"
      accessibilityLabel="Loading subscriptions"
    >
      <SurfaceCard style={styles.summary}>
        <View style={[styles.shortLine, { backgroundColor: colors.surfaceMuted }]} />
        <View style={[styles.totalLine, { backgroundColor: colors.surfaceMuted }]} />
        <View style={[styles.mediumLine, { backgroundColor: colors.surfaceMuted }]} />
      </SurfaceCard>
      <View style={styles.rows}>
        {[0, 1, 2].map((row) => (
          <SurfaceCard key={row} style={styles.row}>
            <View style={[styles.avatar, { backgroundColor: colors.surfaceMuted }]} />
            <View style={styles.rowText}>
              <View style={[styles.mediumLine, { backgroundColor: colors.surfaceMuted }]} />
              <View style={[styles.shortLine, { backgroundColor: colors.surfaceMuted }]} />
            </View>
          </SurfaceCard>
        ))}
      </View>
      <Text style={[styles.loadingText, { color: colors.textMuted }]}>Loading subscriptions…</Text>
    </View>
  );
}

export function DataErrorState({
  message,
  onRetry,
}: {
  message?: string | null;
  onRetry?: () => void;
}) {
  return (
    <View style={styles.error}>
      <EmptyState
        icon="alert-circle-outline"
        title="SubTrack couldn’t load"
        message={message ?? "Please try again."}
        actionLabel={onRetry ? "Try again" : undefined}
        onAction={onRetry}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    width: "100%",
    maxWidth: 760,
    alignSelf: "center",
    paddingHorizontal: 20,
    paddingTop: 8,
    gap: 18,
  },
  summary: { minHeight: 170, padding: 22, gap: 14 },
  rows: { gap: 10 },
  row: { minHeight: 70, padding: 13, flexDirection: "row", alignItems: "center", gap: 12 },
  rowText: { flex: 1, gap: 9 },
  avatar: { width: 44, height: 44, borderRadius: 22 },
  shortLine: { width: "32%", height: 11, borderRadius: 6 },
  mediumLine: { width: "58%", height: 13, borderRadius: 7 },
  totalLine: { width: "48%", height: 36, borderRadius: 10 },
  loadingText: { textAlign: "center", fontSize: 13 },
  error: { flex: 1, justifyContent: "center" },
});
