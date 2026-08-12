import { addDays, startOfDay } from "date-fns";

import { DEFAULT_CATEGORIES } from "@/constants/categories";
import type { Db } from "@/db/database";
import { getAllSubscriptions, createSubscription } from "@/db/repositories/subscriptionRepository";
import { newId } from "@/utils/id";

interface SampleSeed {
  name: string;
  priceMinor: number;
  currency: string;
  billingInterval: number;
  billingUnit: "month" | "year";
  categoryId: string;
  offsetDays: number;
}

const SAMPLES: SampleSeed[] = [
  {
    name: "Netflix",
    priceMinor: 2299,
    currency: "USD",
    billingInterval: 1,
    billingUnit: "month",
    categoryId: "cat-entertainment",
    offsetDays: 1,
  },
  {
    name: "Spotify",
    priceMinor: 1199,
    currency: "USD",
    billingInterval: 1,
    billingUnit: "month",
    categoryId: "cat-music",
    offsetDays: 6,
  },
  {
    name: "iCloud+",
    priceMinor: 299,
    currency: "USD",
    billingInterval: 1,
    billingUnit: "month",
    categoryId: "cat-cloud",
    offsetDays: 12,
  },
  {
    name: "Figma",
    priceMinor: 14400,
    currency: "USD",
    billingInterval: 1,
    billingUnit: "year",
    categoryId: "cat-productivity",
    offsetDays: 30,
  },
  {
    name: "PlayStation Plus",
    priceMinor: 7999,
    currency: "USD",
    billingInterval: 1,
    billingUnit: "year",
    categoryId: "cat-gaming",
    offsetDays: 45,
  },
];

/**
 * Seeds a handful of sample subscriptions when the database is empty.
 * Development/demo helper only — never invoked automatically for production users.
 */
export async function seedSampleData(db: Db): Promise<number> {
  const existing = await getAllSubscriptions(db);
  if (existing.length > 0) return 0;

  const today = startOfDay(new Date());
  const categoryIds = new Map(DEFAULT_CATEGORIES.map((c) => [c.id, c.id]));

  let created = 0;
  for (const sample of SAMPLES) {
    const offset = addDays(today, sample.offsetDays);
    await createSubscription(db, {
      name: sample.name,
      priceMinor: sample.priceMinor,
      currency: sample.currency,
      billingInterval: sample.billingInterval,
      billingUnit: sample.billingUnit,
      startDate: formatDate(addDays(today, -sample.offsetDays)),
      nextBillingDate: formatDate(offset),
      categoryId: categoryIds.get(sample.categoryId) ?? null,
      notes: null,
      status: "active",
      reminderDaysBefore: null,
    });
    created += 1;
  }
  return created;
}

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export { newId };
