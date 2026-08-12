import React, { useState } from "react";
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Icon, type IconName } from "@/components/Icon";
import { Screen } from "@/components/Screen";
import { TabHeader } from "@/components/ScreenHeader";
import { SegmentChips } from "@/components/SegmentChips";
import { SelectField } from "@/components/SelectField";
import { Divider, GlassSurface, SectionLabel } from "@/components/ui";
import { CURRENCIES } from "@/constants/currencies";
import { DEFAULT_REMINDER_OPTIONS } from "@/constants/reminders";
import { APP_NAME, APP_VERSION, type AppSettings } from "@/domain/types";
import { useData } from "@/hooks/useData";
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
    isRefreshing,
    db,
    settings,
    updateSettings,
    importData,
    resetAllData,
    seedDemo,
    refresh,
  } = useData();
  const [busy, setBusy] = useState<string | null>(null);
  const [resetOpen, setResetOpen] = useState(false);
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
      onRefresh={() => void refresh()}
      contentContainerStyle={styles.bottom}
    >
      <TabHeader title="Settings" subtitle={`${APP_NAME} · Version ${APP_VERSION}`} />
      <View style={styles.content}>
        <View style={styles.section}>
          <SectionLabel>Preferences</SectionLabel>
          <GlassSurface style={styles.card}>
            <View>
              <Text style={[styles.fieldTitle, { color: colors.text }]}>Appearance</Text>
              <SegmentChips
                options={APPEARANCE}
                value={settings.appearance}
                onChange={(v) =>
                  void updateSettings({ appearance: (v as AppSettings["appearance"]) ?? "system" })
                }
              />
            </View>
            <Divider />
            <SelectField
              label="Default currency"
              options={CURRENCIES.map((c) => ({ value: c.code, label: `${c.code} · ${c.name}` }))}
              value={settings.currency}
              onChange={(v) => void updateSettings({ currency: v ?? "USD" })}
            />
            <Divider />
            <View>
              <Text style={[styles.fieldTitle, { color: colors.text }]}>Default reminder</Text>
              <SegmentChips
                options={DEFAULT_REMINDER_OPTIONS.map((o) => ({
                  value: String(o.value),
                  label: o.label,
                }))}
                value={
                  settings.defaultReminderDays == null ? "-1" : String(settings.defaultReminderDays)
                }
                onChange={(v) =>
                  void updateSettings({
                    defaultReminderDays: !v || v === "-1" ? null : parseInt(v, 10),
                  })
                }
              />
            </View>
          </GlassSurface>
        </View>
        <View style={styles.section}>
          <SectionLabel>Your data</SectionLabel>
          <GlassSurface>
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
          </GlassSurface>
        </View>
        {__DEV__ ? (
          <View style={styles.section}>
            <SectionLabel>Developer</SectionLabel>
            <GlassSurface>
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
            </GlassSurface>
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
  bottom: { paddingBottom: 110 },
  content: { paddingHorizontal: 20, gap: 26, width: "100%", maxWidth: 720, alignSelf: "center" },
  section: { gap: 10 },
  card: { padding: 18, gap: 20 },
  fieldTitle: { fontSize: 15, fontWeight: "700", marginBottom: 10 },
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
