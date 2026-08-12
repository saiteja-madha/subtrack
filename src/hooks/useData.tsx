import React, { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { openDatabase } from "@/db";
import type { Db } from "@/db/database";
import * as categoryRepo from "@/db/repositories/categoryRepository";
import * as settingsRepo from "@/db/repositories/settingsRepository";
import * as subscriptionRepo from "@/db/repositories/subscriptionRepository";
import type {
  AppSettings,
  Category,
  Subscription,
  SubscriptionInput,
  SubscriptionStatus,
} from "@/domain/types";
import {
  cancelAllReminders,
  configureNotifications,
  rescheduleAllReminders,
  scheduleSubscriptionReminder,
} from "@/services/notificationService";
import { seedSampleData } from "@/services/seedService";

type LoadStatus = "loading" | "ready" | "error";

interface DataContextValue {
  db: Db | null;
  status: LoadStatus;
  error: string | null;
  subscriptions: Subscription[];
  categories: Category[];
  settings: AppSettings;
  refresh: () => Promise<void>;
  retry: () => Promise<void>;
  addSubscription: (input: SubscriptionInput) => Promise<Subscription>;
  updateSubscription: (id: string, input: SubscriptionInput) => Promise<Subscription | null>;
  deleteSubscription: (id: string) => Promise<void>;
  setSubscriptionStatus: (id: string, status: SubscriptionStatus) => Promise<Subscription | null>;
  updateSettings: (patch: Partial<AppSettings>) => Promise<AppSettings>;
  importData: (raw: unknown) => Promise<{ imported: number }>;
  resetAllData: () => Promise<void>;
  seedDemo: () => Promise<number>;
}

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [db, setDb] = useState<Db | null>(null);
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [error, setError] = useState<string | null>(null);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<AppSettings>({
    currency: "USD",
    appearance: "system",
    defaultReminderDays: null,
  });

  const loadAll = useCallback(async (database: Db) => {
    const [subs, cats, appSettings] = await Promise.all([
      subscriptionRepo.getAllSubscriptions(database),
      categoryRepo.getAllCategories(database),
      settingsRepo.getSettings(database),
    ]);
    setSubscriptions(subs);
    setCategories(cats);
    setSettings(appSettings);
    void rescheduleAllReminders(subs, appSettings);
  }, []);

  const initialize = useCallback(async () => {
    setStatus("loading");
    setError(null);
    try {
      const database = await openDatabase();
      configureNotifications();
      await categoryRepo.ensureDefaultCategories(database);
      setDb(database);
      await loadAll(database);
      setStatus("ready");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to initialize the database.");
      setStatus("error");
    }
  }, [loadAll]);

  useEffect(() => {
    void initialize();
  }, [initialize]);

  const refresh = useCallback(async () => {
    if (!db) return;
    await loadAll(db);
  }, [db, loadAll]);

  const addSubscription = useCallback(
    async (input: SubscriptionInput) => {
      if (!db) throw new Error("Database not ready");
      const created = await subscriptionRepo.createSubscription(db, input);
      setSubscriptions((prev) => [created, ...prev]);
      void scheduleSubscriptionReminder(created, settings.defaultReminderDays);
      return created;
    },
    [db, settings.defaultReminderDays],
  );

  const updateSubscription = useCallback(
    async (id: string, input: SubscriptionInput) => {
      if (!db) throw new Error("Database not ready");
      const updated = await subscriptionRepo.updateSubscription(db, id, input);
      if (updated) {
        setSubscriptions((prev) => prev.map((s) => (s.id === id ? updated : s)));
        void scheduleSubscriptionReminder(updated, settings.defaultReminderDays);
      }
      return updated;
    },
    [db, settings.defaultReminderDays],
  );

  const deleteSubscription = useCallback(
    async (id: string) => {
      if (!db) throw new Error("Database not ready");
      await subscriptionRepo.deleteSubscription(db, id);
      setSubscriptions((prev) => prev.filter((s) => s.id !== id));
      await cancelAllRemindersFor([id]);
    },
    [db],
  );

  const setSubscriptionStatus = useCallback(
    async (id: string, status: SubscriptionStatus) => {
      if (!db) throw new Error("Database not ready");
      const updated = await subscriptionRepo.setSubscriptionStatus(db, id, status);
      if (updated) {
        setSubscriptions((prev) => prev.map((s) => (s.id === id ? updated : s)));
        void scheduleSubscriptionReminder(updated, settings.defaultReminderDays);
      }
      return updated;
    },
    [db, settings.defaultReminderDays],
  );

  const updateSettings = useCallback(
    async (patch: Partial<AppSettings>) => {
      if (!db) throw new Error("Database not ready");
      const next = await settingsRepo.updateSettings(db, patch);
      setSettings(next);
      void rescheduleAllReminders(subscriptions, next);
      return next;
    },
    [db, subscriptions],
  );

  const importData = useCallback(
    async (raw: unknown) => {
      if (!db) throw new Error("Database not ready");
      const { importBackupData } = await import("@/services/backupService");
      const result = await importBackupData(db, raw);
      await loadAll(db);
      return result;
    },
    [db, loadAll],
  );

  const resetAllData = useCallback(async () => {
    if (!db) return;
    await db.withTransactionAsync(async () => {
      await subscriptionRepo.clearSubscriptions(db);
      await categoryRepo.clearCategories(db);
      await settingsRepo.clearSettings(db);
    });
    // ensureDefaultCategories manages its own transaction, so it must run
    // after the reset transaction has committed.
    await categoryRepo.ensureDefaultCategories(db);
    await cancelAllReminders();
    await loadAll(db);
  }, [db, loadAll]);

  const seedDemo = useCallback(async () => {
    if (!db) return 0;
    const count = await seedSampleData(db);
    await loadAll(db);
    return count;
  }, [db, loadAll]);

  const value = useMemo<DataContextValue>(
    () => ({
      db,
      status,
      error,
      subscriptions,
      categories,
      settings,
      refresh,
      retry: initialize,
      addSubscription,
      updateSubscription,
      deleteSubscription,
      setSubscriptionStatus,
      updateSettings,
      importData,
      resetAllData,
      seedDemo,
    }),
    [
      db,
      status,
      error,
      subscriptions,
      categories,
      settings,
      refresh,
      initialize,
      addSubscription,
      updateSubscription,
      deleteSubscription,
      setSubscriptionStatus,
      updateSettings,
      importData,
      resetAllData,
      seedDemo,
    ],
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

async function cancelAllRemindersFor(ids: string[]): Promise<void> {
  const { cancelReminder } = await import("@/services/notificationService");
  await Promise.all(ids.map((id) => cancelReminder(id).catch(() => undefined)));
}

export function useData(): DataContextValue {
  const ctx = React.use(DataContext);
  if (!ctx) {
    throw new Error("useData must be used within a DataProvider");
  }
  return ctx;
}
