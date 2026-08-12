import React, { useState } from "react";
import { ActivityIndicator, Alert, Pressable, StyleSheet, Switch, Text, View } from "react-native";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { DataErrorState, LoadingState } from "@/components/DataState";
import { Icon, type IconName } from "@/components/Icon";
import { Screen } from "@/components/Screen";
import { TabHeader } from "@/components/ScreenHeader";
import { SelectField } from "@/components/SelectField";
import { Divider, SectionLabel, SurfaceCard } from "@/components/ui";
import { CURRENCIES } from "@/constants/currencies";
import { APP_NAME, type AppSettings } from "@/domain/types";
import { useData } from "@/hooks/useData";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import { pickBackupFile, readBackupJson, shareBackup } from "@/services/backupService";
import { useAppTheme } from "@/theme";
const APPEARANCE = [
  { value: "system", label: "System" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];
function ActionRow({
  icon,
  label,
  description,
  busy,
  onPress,
}: {
  icon: IconName;
  label: string;
  description: string;
  busy?: boolean;
  onPress: () => void;
}) {
  const { colors } = useAppTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={busy}
      style={({ pressed }) => [styles.action, { opacity: busy ? 0.5 : pressed ? 0.65 : 1 }]}
      accessibilityRole="button"
    >
      <View style={[styles.actionIcon, { backgroundColor: colors.primarySoft }]}>
        <Icon name={icon} size={19} color={colors.primary} />
      </View>
      <View style={styles.flex}>
        <Text style={[styles.actionLabel, { color: colors.text }]}>{label}</Text>
        <Text style={[styles.description, { color: colors.textMuted }]}>{description}</Text>
      </View>
      {busy ? (
        <ActivityIndicator size="small" color={colors.primary} />
      ) : (
        <Icon name="chevron-forward" size={18} color={colors.textMuted} />
      )}
    </Pressable>
  );
}
export default function SettingsScreen() {
  const { colors } = useAppTheme();
  const {
    status,
    error,
    db,
    settings,
    updateSettings,
    importData,
    resetAllData,
    seedDemo,
    refresh,
    retry,
  } = useData();
  const { isRefreshing, onRefresh } = usePullToRefresh(refresh);
  const [busy, setBusy] = useState<string | null>(null);
  const [resetOpen, setResetOpen] = useState(false);
  if (status === "loading") {
    return (
      <Screen scroll={false} header={<TabHeader title="Settings" />}>
        <LoadingState />
      </Screen>
    );
  }
  if (status === "error") {
    return (
      <Screen scroll={false} header={<TabHeader title="Settings" />}>
        <DataErrorState message={error} onRetry={() => void retry()} />
      </Screen>
    );
  }
  const run = async (key: string, fn: () => Promise<void>) => {
    setBusy(key);
    try {
      await fn();
    } catch (e) {
      Alert.alert("Something went wrong", e instanceof Error ? e.message : "Please try again.");
    } finally {
      setBusy(null);
    }
  };
  const exportData = () =>
    run("export", async () => {
      if (db) await shareBackup(db);
    });
  const importBackup = () =>
    run("import", async () => {
      if (!db) return;
      const picked = await pickBackupFile();
      if (!picked) return;
      const result = await importData(await readBackupJson(picked.uri));
      Alert.alert("Import complete", `${result.imported} subscriptions imported.`);
    });
  const reset = () =>
    run("reset", async () => {
      await resetAllData();
      setResetOpen(false);
      Alert.alert("Done", "All subscriptions and settings have been erased.");
    });
  return (
    <Screen
      refreshing={isRefreshing}
      onRefresh={onRefresh}
      contentContainerStyle={styles.bottom}
      header={<TabHeader title="Settings" />}
    >
      <View style={styles.content}>
        <View style={styles.section}>
          <SectionLabel>Preferences</SectionLabel>
          <SurfaceCard style={styles.settingsCard}>
            <SelectField
              variant="settings"
              options={APPEARANCE}
              value={settings.appearance}
              label="Appearance"
              onChange={(v) =>
                void updateSettings({ appearance: (v as AppSettings["appearance"]) ?? "system" })
              }
            />
            <Divider inset={16} />
            <SelectField
              variant="settings"
              label="Default currency"
              options={CURRENCIES.map((c) => ({ value: c.code, label: `${c.code} · ${c.name}` }))}
              value={settings.currency}
              onChange={(v) => void updateSettings({ currency: v ?? "USD" })}
            />
            <Divider inset={16} />
            <View style={styles.settingsSwitchRow}>
              <Text style={[styles.settingsSwitchLabel, { color: colors.text }]}>
                Default reminder
              </Text>
              <Switch
                value={settings.defaultReminderDays != null}
                onValueChange={(enabled) =>
                  void updateSettings({ defaultReminderDays: enabled ? 1 : null })
                }
                trackColor={{ false: colors.surfaceMuted, true: colors.primary }}
                thumbColor={colors.surfaceStrong}
                accessibilityLabel="Default reminder"
              />
            </View>
          </SurfaceCard>
        </View>
        <View style={styles.section}>
          <SectionLabel>Your data</SectionLabel>
          <SurfaceCard>
            <ActionRow
              icon="share-outline"
              label="Export backup"
              description="Download or share a JSON copy"
              busy={busy === "export"}
              onPress={exportData}
            />
            <Divider inset={16} />
            <ActionRow
              icon="download-outline"
              label="Import backup"
              description="Restore a previous SubTrack backup"
              busy={busy === "import"}
              onPress={importBackup}
            />
            <Divider inset={16} />
            <ActionRow
              icon="trash-outline"
              label="Reset all data"
              description="Erase subscriptions and preferences"
              busy={busy === "reset"}
              onPress={() => setResetOpen(true)}
            />
          </SurfaceCard>
        </View>
        {__DEV__ ? (
          <View style={styles.section}>
            <SectionLabel>Developer</SectionLabel>
            <SurfaceCard>
              <ActionRow
                icon="sparkles-outline"
                label="Add sample data"
                description="Populate the app for visual testing"
                busy={busy === "seed"}
                onPress={() =>
                  void run("seed", async () => {
                    const count = await seedDemo();
                    Alert.alert("Demo data", `${count} sample subscriptions added.`);
                  })
                }
              />
            </SurfaceCard>
          </View>
        ) : null}
        <Text style={[styles.footer, { color: colors.textMuted }]}>
          {APP_NAME} keeps your data on this device.
        </Text>
      </View>
      <ConfirmDialog
        isOpen={resetOpen}
        onOpenChange={setResetOpen}
        title="Reset all data?"
        message="This permanently deletes every subscription, category, and setting."
        confirmLabel="Erase everything"
        tone="danger"
        isLoading={busy === "reset"}
        onConfirm={() => void reset()}
      />
    </Screen>
  );
}
const styles = StyleSheet.create({
  bottom: { paddingBottom: 32 },
  content: { paddingHorizontal: 20, gap: 26, width: "100%", maxWidth: 720, alignSelf: "center" },
  section: { gap: 10 },
  card: { padding: 18, gap: 20 },
  settingsCard: { paddingVertical: 0 },
  settingsSwitchRow: {
    minHeight: 52,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  settingsSwitchLabel: { fontSize: 16 },
  action: {
    minHeight: 74,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  actionIcon: {
    width: 38,
    height: 38,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  flex: { flex: 1 },
  actionLabel: { fontSize: 15, fontWeight: "700" },
  description: { fontSize: 12, marginTop: 3 },
  footer: { textAlign: "center", fontSize: 12, marginBottom: 18 },
});
