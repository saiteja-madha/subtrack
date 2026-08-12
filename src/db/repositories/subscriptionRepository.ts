import type { Db } from "@/db/database";
import type {
  BillingUnit,
  Subscription,
  SubscriptionInput,
  SubscriptionStatus,
} from "@/domain/types";
import { newId } from "@/utils/id";

interface SubscriptionRow {
  id: string;
  name: string;
  price_minor: number;
  currency: string;
  billing_interval: number;
  billing_unit: BillingUnit;
  start_date: string | null;
  next_billing_date: string;
  category_id: string | null;
  notes: string | null;
  status: SubscriptionStatus;
  reminder_days_before: number | null;
  created_at: string;
  updated_at: string;
}

function rowToSubscription(row: SubscriptionRow): Subscription {
  return {
    id: row.id,
    name: row.name,
    priceMinor: row.price_minor,
    currency: row.currency,
    billingInterval: row.billing_interval,
    billingUnit: row.billing_unit,
    startDate: row.start_date ?? null,
    nextBillingDate: row.next_billing_date,
    categoryId: row.category_id ?? null,
    notes: row.notes ?? null,
    status: row.status,
    reminderDaysBefore: row.reminder_days_before ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getAllSubscriptions(db: Db): Promise<Subscription[]> {
  const rows = await db.getAllAsync<SubscriptionRow>(
    "SELECT * FROM subscriptions ORDER BY created_at DESC, rowid DESC",
  );
  return rows.map(rowToSubscription);
}

export async function getSubscriptionById(db: Db, id: string): Promise<Subscription | null> {
  const row = await db.getFirstAsync<SubscriptionRow>("SELECT * FROM subscriptions WHERE id = ?", [
    id,
  ]);
  return row ? rowToSubscription(row) : null;
}

export interface CreateSubscriptionOptions {
  id?: string;
  createdAt?: string;
  updatedAt?: string;
}

export async function createSubscription(
  db: Db,
  input: SubscriptionInput,
  options: CreateSubscriptionOptions = {},
): Promise<Subscription> {
  const now = new Date().toISOString();
  const id = options.id ?? newId("sub");
  const createdAt = options.createdAt ?? now;
  const updatedAt = options.updatedAt ?? now;

  await db.runAsync(
    `INSERT INTO subscriptions (
      id, name, price_minor, currency, billing_interval, billing_unit,
      start_date, next_billing_date, category_id, notes, status,
      reminder_days_before, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      input.name,
      input.priceMinor,
      input.currency,
      input.billingInterval,
      input.billingUnit,
      input.startDate ?? null,
      input.nextBillingDate,
      input.categoryId ?? null,
      input.notes ?? null,
      input.status,
      input.reminderDaysBefore ?? null,
      createdAt,
      updatedAt,
    ],
  );

  return {
    id,
    name: input.name,
    priceMinor: input.priceMinor,
    currency: input.currency,
    billingInterval: input.billingInterval,
    billingUnit: input.billingUnit,
    startDate: input.startDate ?? null,
    nextBillingDate: input.nextBillingDate,
    categoryId: input.categoryId ?? null,
    notes: input.notes ?? null,
    status: input.status,
    reminderDaysBefore: input.reminderDaysBefore ?? null,
    createdAt,
    updatedAt,
  };
}

export async function updateSubscription(
  db: Db,
  id: string,
  input: SubscriptionInput,
): Promise<Subscription | null> {
  const now = new Date().toISOString();
  await db.runAsync(
    `UPDATE subscriptions SET
      name = ?, price_minor = ?, currency = ?, billing_interval = ?, billing_unit = ?,
      start_date = ?, next_billing_date = ?, category_id = ?, notes = ?, status = ?,
      reminder_days_before = ?, updated_at = ?
    WHERE id = ?`,
    [
      input.name,
      input.priceMinor,
      input.currency,
      input.billingInterval,
      input.billingUnit,
      input.startDate ?? null,
      input.nextBillingDate,
      input.categoryId ?? null,
      input.notes ?? null,
      input.status,
      input.reminderDaysBefore ?? null,
      now,
      id,
    ],
  );
  return getSubscriptionById(db, id);
}

export async function setSubscriptionStatus(
  db: Db,
  id: string,
  status: SubscriptionStatus,
): Promise<Subscription | null> {
  await db.runAsync("UPDATE subscriptions SET status = ?, updated_at = ? WHERE id = ?", [
    status,
    new Date().toISOString(),
    id,
  ]);
  return getSubscriptionById(db, id);
}

export async function deleteSubscription(db: Db, id: string): Promise<void> {
  await db.runAsync("DELETE FROM subscriptions WHERE id = ?", [id]);
}

export async function clearSubscriptions(db: Db): Promise<void> {
  await db.runAsync("DELETE FROM subscriptions");
}

/** Restores an exact subscription row during import. */
export async function insertSubscriptionRaw(db: Db, sub: Subscription): Promise<void> {
  await db.runAsync(
    `INSERT INTO subscriptions (
      id, name, price_minor, currency, billing_interval, billing_unit,
      start_date, next_billing_date, category_id, notes, status,
      reminder_days_before, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      sub.id,
      sub.name,
      sub.priceMinor,
      sub.currency,
      sub.billingInterval,
      sub.billingUnit,
      sub.startDate ?? null,
      sub.nextBillingDate,
      sub.categoryId ?? null,
      sub.notes ?? null,
      sub.status,
      sub.reminderDaysBefore ?? null,
      sub.createdAt,
      sub.updatedAt,
    ],
  );
}
