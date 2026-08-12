import type { AppSettings, Subscription } from "@/domain/types";

const PREFIX = "subtrack-reminder-";
export function notificationIdFor(subscriptionId: string): string {
  return `${PREFIX}${subscriptionId}`;
}
export function configureNotifications(): void {}
export async function ensureNotificationPermissions(): Promise<boolean> {
  return false;
}
export function resetPermissionCache(): void {}
export async function scheduleSubscriptionReminder(
  _subscription: Subscription,
  _defaultReminderDays: number | null,
): Promise<void> {}
export async function cancelReminder(_subscriptionId: string): Promise<void> {}
export async function rescheduleAllReminders(
  _subscriptions: Subscription[],
  _settings: AppSettings,
): Promise<void> {}
export async function cancelAllReminders(): Promise<void> {}
