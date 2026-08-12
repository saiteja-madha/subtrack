import { beforeAll, beforeEach, describe, expect, it } from "vitest";

import { runMigrations } from "@/db/migrations";
import { createNodeDatabase } from "@/db/nodeAdapter";
import type { Db } from "@/db/database";
import {
  clearCategories,
  createCategory,
  ensureDefaultCategories,
  getAllCategories,
  getCategoryById,
} from "@/db/repositories/categoryRepository";
import { getSettings, setSetting, updateSettings } from "@/db/repositories/settingsRepository";
import {
  clearSubscriptions,
  createSubscription,
  deleteSubscription,
  getAllSubscriptions,
  getSubscriptionById,
  insertSubscriptionRaw,
  setSubscriptionStatus,
  updateSubscription,
} from "@/db/repositories/subscriptionRepository";
import { DEFAULT_SETTINGS } from "@/domain/types";

let db: Db;

beforeAll(async () => {
  db = createNodeDatabase();
  await runMigrations(db);
});

beforeEach(async () => {
  await clearSubscriptions(db);
  await clearCategories(db);
  await createCategory(db, {
    id: "cat-1",
    name: "Entertainment",
    icon: "film-outline",
    sortOrder: 0,
  });
});

describe("migrations", () => {
  it("are idempotent", async () => {
    await expect(runMigrations(db)).resolves.toBeUndefined();
  });
});

describe("categoryRepository", () => {
  it("seeds the default categories once", async () => {
    await ensureDefaultCategories(db);
    const first = await getAllCategories(db);
    await ensureDefaultCategories(db);
    const second = await getAllCategories(db);
    expect(second.length).toBe(first.length);
    expect(first.length).toBeGreaterThan(0);
    const byId = new Map(first.map((c) => [c.id, c]));
    expect(byId.get("cat-entertainment")?.isDefault).toBe(true);
  });

  it("creates and fetches a custom category", async () => {
    await createCategory(db, { id: "cat-x", name: "Gym", icon: "barbell-outline", sortOrder: 99 });
    const found = await getCategoryById(db, "cat-x");
    expect(found).toMatchObject({
      id: "cat-x",
      name: "Gym",
      icon: "barbell-outline",
      sortOrder: 99,
    });
    expect(found?.isDefault).toBe(false);
  });

  it("restores defaults after a committed reset transaction", async () => {
    await db.withTransactionAsync(async () => {
      await clearSubscriptions(db);
      await clearCategories(db);
    });

    await expect(ensureDefaultCategories(db)).resolves.toBeUndefined();
    expect((await getAllCategories(db)).length).toBeGreaterThan(0);
  });
});

describe("subscriptionRepository", () => {
  const input = {
    name: "Netflix",
    priceMinor: 2299,
    currency: "USD",
    billingInterval: 1,
    billingUnit: "month" as const,
    startDate: "2026-01-01",
    nextBillingDate: "2026-08-15",
    categoryId: "cat-1",
    notes: "Family plan",
    status: "active" as const,
    reminderDaysBefore: 3,
  };

  it("creates and reads a subscription", async () => {
    const created = await createSubscription(db, input);
    expect(created.id).toMatch(/^sub-/);
    expect(created.priceMinor).toBe(2299);

    const byId = await getSubscriptionById(db, created.id);
    expect(byId).toMatchObject({ name: "Netflix", notes: "Family plan", reminderDaysBefore: 3 });
  });

  it("lists newest first", async () => {
    const older = await createSubscription(db, input, {
      id: "sub-old",
      createdAt: "2026-01-01T00:00:00Z",
    });
    const newer = await createSubscription(db, input, {
      id: "sub-new",
      createdAt: "2026-02-01T00:00:00Z",
    });
    const all = await getAllSubscriptions(db);
    expect(all.map((s) => s.id)).toEqual([newer.id, older.id]);
  });

  it("updates a subscription", async () => {
    const created = await createSubscription(db, input);
    const updated = await updateSubscription(db, created.id, {
      ...input,
      name: "Netflix Premium",
      priceMinor: 2999,
    });
    expect(updated?.name).toBe("Netflix Premium");
    expect(updated?.priceMinor).toBe(2999);
  });

  it("changes status", async () => {
    const created = await createSubscription(db, input);
    const paused = await setSubscriptionStatus(db, created.id, "paused");
    expect(paused?.status).toBe("paused");
  });

  it("deletes a subscription", async () => {
    const created = await createSubscription(db, input);
    await deleteSubscription(db, created.id);
    expect(await getSubscriptionById(db, created.id)).toBeNull();
  });

  it("inserts a raw row for import", async () => {
    const sub = {
      id: "sub-import",
      ...input,
      createdAt: "2026-01-01T00:00:00Z",
      updatedAt: "2026-01-01T00:00:00Z",
    };
    await insertSubscriptionRaw(db, sub);
    expect(await getSubscriptionById(db, "sub-import")).toMatchObject({ id: "sub-import" });
  });
});

describe("settingsRepository", () => {
  it("returns defaults before any setting is written", async () => {
    const settings = await getSettings(db);
    expect(settings).toEqual(DEFAULT_SETTINGS);
  });

  it("persists individual settings", async () => {
    await setSetting(db, "currency", "EUR");
    await setSetting(db, "appearance", "dark");
    const settings = await getSettings(db);
    expect(settings.currency).toBe("EUR");
    expect(settings.appearance).toBe("dark");
  });

  it("updates in bulk", async () => {
    await updateSettings(db, { currency: "JPY", defaultReminderDays: 1 });
    const settings = await getSettings(db);
    expect(settings.currency).toBe("JPY");
    expect(settings.defaultReminderDays).toBe(1);
  });
});
