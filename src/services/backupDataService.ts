import type { Db } from "@/db/database";
import {
  clearCategories,
  getAllCategories,
  insertCategoryRaw,
} from "@/db/repositories/categoryRepository";
import { clearSettings, getSettings, updateSettings } from "@/db/repositories/settingsRepository";
import {
  clearSubscriptions,
  getAllSubscriptions,
  insertSubscriptionRaw,
} from "@/db/repositories/subscriptionRepository";
import {
  DEFAULT_SETTINGS,
  type AppSettings,
  type Category,
  type Subscription,
} from "@/domain/types";

export const BACKUP_VERSION = 1;

export interface BackupData {
  version: number;
  exportedAt: string;
  subscriptions: Subscription[];
  categories: Category[];
  settings: AppSettings;
}

export class BackupError extends Error {}

export async function buildBackup(db: Db): Promise<BackupData> {
  const [subscriptions, categories, settings] = await Promise.all([
    getAllSubscriptions(db),
    getAllCategories(db),
    getSettings(db),
  ]);
  return {
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    subscriptions,
    categories,
    settings,
  };
}

type ValidationResult = { ok: true; data: BackupData } | { ok: false; error: string };

/** Validates a parsed backup before anything is written to the database. */
export function validateBackup(raw: unknown): ValidationResult {
  if (typeof raw !== "object" || raw === null) {
    return { ok: false, error: "Not a valid backup file." };
  }

  const obj = raw as Record<string, unknown>;
  if (obj.version !== BACKUP_VERSION) {
    return {
      ok: false,
      error: `Unsupported backup version (expected ${BACKUP_VERSION}).`,
    };
  }
  if (!Array.isArray(obj.subscriptions) || !Array.isArray(obj.categories)) {
    return { ok: false, error: "Backup is missing subscriptions or categories." };
  }

  const subscriptions: Subscription[] = [];
  for (const item of obj.subscriptions) {
    const parsed = parseSubscription(item);
    if (!parsed) return { ok: false, error: "Backup contains an invalid subscription." };
    subscriptions.push(parsed);
  }

  const categories: Category[] = [];
  for (const item of obj.categories) {
    const parsed = parseCategory(item);
    if (!parsed) return { ok: false, error: "Backup contains an invalid category." };
    categories.push(parsed);
  }

  const settings: AppSettings = {
    ...DEFAULT_SETTINGS,
    ...(typeof obj.settings === "object" && obj.settings !== null
      ? (obj.settings as Partial<AppSettings>)
      : {}),
  };
  if (typeof settings.currency !== "string" || settings.currency.length !== 3) {
    settings.currency = DEFAULT_SETTINGS.currency;
  }
  if (!["system", "light", "dark"].includes(settings.appearance)) {
    settings.appearance = DEFAULT_SETTINGS.appearance;
  }
  if (typeof settings.defaultReminderDays !== "number") {
    settings.defaultReminderDays = DEFAULT_SETTINGS.defaultReminderDays;
  }

  return {
    ok: true,
    data: {
      version: BACKUP_VERSION,
      exportedAt: typeof obj.exportedAt === "string" ? obj.exportedAt : new Date().toISOString(),
      subscriptions,
      categories,
      settings,
    },
  };
}

/** Replaces all app data atomically with validated backup content. */
export async function importBackupData(db: Db, raw: unknown): Promise<{ imported: number }> {
  const validated = validateBackup(raw);
  if (!validated.ok) throw new BackupError(validated.error);

  const { data } = validated;
  await db.withTransactionAsync(async () => {
    await clearSubscriptions(db);
    await clearCategories(db);
    await clearSettings(db);
    for (const category of data.categories) await insertCategoryRaw(db, category);
    for (const subscription of data.subscriptions) await insertSubscriptionRaw(db, subscription);
    await updateSettings(db, data.settings);
  });

  return { imported: data.subscriptions.length };
}

const SUBSCRIPTION_STATUSES = ["active", "paused", "cancelled"];
const BILLING_UNITS = ["day", "week", "month", "year"];

function parseSubscription(item: unknown): Subscription | null {
  if (typeof item !== "object" || item === null) return null;
  const sub = item as Record<string, unknown>;
  if (typeof sub.id !== "string") return null;
  if (typeof sub.name !== "string" || !sub.name.trim()) return null;
  if (typeof sub.priceMinor !== "number" || !Number.isInteger(sub.priceMinor) || sub.priceMinor < 0)
    return null;
  if (typeof sub.currency !== "string") return null;
  if (
    typeof sub.billingInterval !== "number" ||
    !Number.isInteger(sub.billingInterval) ||
    sub.billingInterval < 1
  )
    return null;
  if (typeof sub.billingUnit !== "string" || !BILLING_UNITS.includes(sub.billingUnit)) return null;
  if (typeof sub.nextBillingDate !== "string" || !isValidIsoDate(sub.nextBillingDate)) return null;
  if (typeof sub.status !== "string" || !SUBSCRIPTION_STATUSES.includes(sub.status)) return null;
  if (
    sub.reminderDaysBefore != null &&
    (typeof sub.reminderDaysBefore !== "number" ||
      !Number.isInteger(sub.reminderDaysBefore) ||
      sub.reminderDaysBefore < -1)
  )
    return null;
  if (sub.createdAt != null && typeof sub.createdAt !== "string") return null;
  if (sub.updatedAt != null && typeof sub.updatedAt !== "string") return null;

  return {
    id: sub.id,
    name: sub.name.trim(),
    priceMinor: sub.priceMinor,
    currency: sub.currency,
    billingInterval: sub.billingInterval,
    billingUnit: sub.billingUnit as Subscription["billingUnit"],
    startDate:
      typeof sub.startDate === "string" && isValidIsoDate(sub.startDate) ? sub.startDate : null,
    nextBillingDate: sub.nextBillingDate,
    categoryId: typeof sub.categoryId === "string" ? sub.categoryId : null,
    notes: typeof sub.notes === "string" ? sub.notes : null,
    status: sub.status as Subscription["status"],
    reminderDaysBefore: sub.reminderDaysBefore ?? null,
    createdAt: typeof sub.createdAt === "string" ? sub.createdAt : new Date().toISOString(),
    updatedAt: typeof sub.updatedAt === "string" ? sub.updatedAt : new Date().toISOString(),
  };
}

function parseCategory(item: unknown): Category | null {
  if (typeof item !== "object" || item === null) return null;
  const cat = item as Record<string, unknown>;
  if (typeof cat.id !== "string" || !cat.id.trim()) return null;
  if (typeof cat.name !== "string" || !cat.name.trim()) return null;
  return {
    id: cat.id,
    name: cat.name.trim(),
    icon: typeof cat.icon === "string" ? cat.icon : "",
    sortOrder:
      typeof cat.sortOrder === "number" && Number.isInteger(cat.sortOrder) ? cat.sortOrder : 0,
    isDefault: Boolean(cat.isDefault),
  };
}

function isValidIsoDate(value: string): boolean {
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(new Date(`${value}T00:00:00`).getTime())
  );
}
