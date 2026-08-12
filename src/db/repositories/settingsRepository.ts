import type { Db } from "@/db/database";
import { DEFAULT_SETTINGS, type AppSettings, type AppearanceMode } from "@/domain/types";

type SettingValue = string | number | boolean | null;

interface SettingRow {
  key: string;
  value: string;
}

const SETTING_KEYS = ["currency", "appearance", "defaultReminderDays"] as const;

export async function getSettings(db: Db): Promise<AppSettings> {
  const rows = await db.getAllAsync<SettingRow>("SELECT key, value FROM settings");
  const raw = new Map(rows.map((row) => [row.key, row.value]));

  return {
    currency: parseSetting(raw.get("currency"), DEFAULT_SETTINGS.currency) as string,
    appearance: parseSetting(raw.get("appearance"), DEFAULT_SETTINGS.appearance) as AppearanceMode,
    defaultReminderDays: parseReminderDays(raw.get("defaultReminderDays")),
  };
}

export async function setSetting(db: Db, key: string, value: SettingValue): Promise<void> {
  await db.runAsync(
    "INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
    [key, JSON.stringify(value)],
  );
}

export async function updateSettings(db: Db, patch: Partial<AppSettings>): Promise<AppSettings> {
  for (const [key, value] of Object.entries(patch)) {
    if (value !== undefined) {
      await setSetting(db, key, value);
    }
  }
  return getSettings(db);
}

export async function clearSettings(db: Db): Promise<void> {
  await db.runAsync("DELETE FROM settings");
}

function parseSetting(value: string | undefined, fallback: string): string {
  if (value == null) return fallback;
  try {
    return JSON.parse(value) as string;
  } catch {
    return fallback;
  }
}

function parseReminderDays(value: string | undefined): number | null {
  if (value == null) return DEFAULT_SETTINGS.defaultReminderDays;
  try {
    const parsed = JSON.parse(value);
    return typeof parsed === "number" ? parsed : null;
  } catch {
    return DEFAULT_SETTINGS.defaultReminderDays;
  }
}

export { SETTING_KEYS };
