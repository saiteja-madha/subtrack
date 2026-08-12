import { afterEach, beforeEach, describe, expect, it } from "vitest";

import type { Db } from "@/db/database";
import { runMigrations } from "@/db/migrations";
import { createNodeDatabase } from "@/db/nodeAdapter";
import {
  createCategory,
  getAllCategories,
  insertCategoryRaw,
} from "@/db/repositories/categoryRepository";
import { getSettings, updateSettings } from "@/db/repositories/settingsRepository";
import { createSubscription, getAllSubscriptions } from "@/db/repositories/subscriptionRepository";
import { BACKUP_VERSION, buildBackup, importBackupData } from "@/services/backupDataService";

let db: Db;

beforeEach(async () => {
  db = createNodeDatabase();
  await runMigrations(db);
});

afterEach(async () => {
  await db.close();
});

describe("backup import", () => {
  it("restores a full backup exactly, including default categories", async () => {
    await insertCategoryRaw(db, {
      id: "cat-default",
      name: "Entertainment",
      icon: "film-outline",
      sortOrder: 0,
      isDefault: true,
    });
    await createCategory(db, {
      id: "cat-custom",
      name: "Fitness",
      icon: "barbell-outline",
      sortOrder: 1,
    });
    await createSubscription(db, {
      name: "Gym",
      priceMinor: 2500,
      currency: "USD",
      billingInterval: 1,
      billingUnit: "month",
      nextBillingDate: "2026-09-01",
      categoryId: "cat-custom",
      status: "active",
      reminderDaysBefore: -1,
    });
    await updateSettings(db, { currency: "EUR", appearance: "dark", defaultReminderDays: 3 });

    const backup = await buildBackup(db);
    await importBackupData(db, backup);

    expect(await getAllCategories(db)).toEqual(backup.categories);
    expect(await getAllSubscriptions(db)).toEqual(backup.subscriptions);
    expect(await getSettings(db)).toEqual(backup.settings);
  });

  it("rolls back all changes when any imported row fails", async () => {
    await createCategory(db, {
      id: "existing-category",
      name: "Existing",
      icon: "folder-outline",
      sortOrder: 0,
    });
    const before = await buildBackup(db);
    const duplicateCategory = {
      id: "duplicate",
      name: "Duplicate",
      icon: "folder-outline",
      sortOrder: 0,
      isDefault: false,
    };
    const invalidAtWrite = {
      version: BACKUP_VERSION,
      exportedAt: new Date().toISOString(),
      subscriptions: [],
      categories: [duplicateCategory, duplicateCategory],
      settings: before.settings,
    };

    await expect(importBackupData(db, invalidAtWrite)).rejects.toThrow();
    expect(await buildBackup(db)).toMatchObject({
      subscriptions: before.subscriptions,
      categories: before.categories,
      settings: before.settings,
    });
  });
});
