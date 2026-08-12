export type ReminderOptionValue = number | -1 | null;

export interface ReminderOption {
  value: ReminderOptionValue;
  label: string;
  description?: string;
}

export const REMINDER_OPTIONS: ReminderOption[] = [
  { value: -1, label: "Off" },
  { value: 0, label: "Same day" },
  { value: 1, label: "1 day before" },
  { value: 3, label: "3 days before" },
  { value: 7, label: "7 days before" },
];

export const DEFAULT_REMINDER_OPTIONS: ReminderOption[] = [
  { value: -1, label: "Off" },
  { value: 0, label: "Same day" },
  { value: 1, label: "1 day before" },
  { value: 3, label: "3 days before" },
  { value: 7, label: "7 days before" },
];

export const SUBSCRIPTION_REMINDER_OPTIONS: ReminderOption[] = [
  { value: null, label: "Default" },
  ...REMINDER_OPTIONS,
];

export function reminderLabel(days: number | null | undefined): string {
  if (days == null) return "Default";
  if (days === -1) return "Off";
  if (days === 0) return "Same day";
  if (days === 1) return "1 day before";
  return `${days} days before`;
}

/**
 * Effective reminder for a subscription:
 * explicit override wins, otherwise falls back to the default setting.
 */
export function effectiveReminderDays(
  reminderDaysBefore: number | null | undefined,
  defaultReminderDays: number | null,
): number | null {
  if (reminderDaysBefore == null) return defaultReminderDays;
  if (reminderDaysBefore === -1) return null;
  return reminderDaysBefore;
}

export function hasEnabledReminders(
  subscriptions: Array<{ status: string; reminderDaysBefore?: number | null }>,
  defaultReminderDays: number | null,
): boolean {
  return subscriptions.some(
    (subscription) =>
      subscription.status === "active" &&
      effectiveReminderDays(subscription.reminderDaysBefore, defaultReminderDays) != null,
  );
}
