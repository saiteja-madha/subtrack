export type SubscriptionStatus = "active" | "paused" | "cancelled";

export type BillingUnit = "day" | "week" | "month" | "year";

export type AppearanceMode = "system" | "light" | "dark";

export interface Subscription {
  id: string;
  name: string;
  priceMinor: number;
  currency: string;
  billingInterval: number;
  billingUnit: BillingUnit;
  startDate?: string | null;
  nextBillingDate: string;
  categoryId?: string | null;
  notes?: string | null;
  status: SubscriptionStatus;
  /** Explicit reminder override in days before renewal. -1 = explicitly off, null = use default. */
  reminderDaysBefore?: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionInput {
  name: string;
  priceMinor: number;
  currency: string;
  billingInterval: number;
  billingUnit: BillingUnit;
  startDate?: string | null;
  nextBillingDate: string;
  categoryId?: string | null;
  notes?: string | null;
  status: SubscriptionStatus;
  reminderDaysBefore?: number | null;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  sortOrder: number;
  isDefault: boolean;
}

export interface AppSettings {
  currency: string;
  appearance: AppearanceMode;
  /** Default reminder in days before renewal. null = off. */
  defaultReminderDays: number | null;
}

export const DEFAULT_SETTINGS: AppSettings = {
  currency: "USD",
  appearance: "system",
  defaultReminderDays: null,
};

export const APP_NAME = "SubTrack";
export const APP_VERSION = "1.0.0";
