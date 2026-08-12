import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { subDays } from "date-fns";

import { getCurrencyInfo, minorToMajor } from "@/constants/currencies";
import { effectiveReminderDays, hasEnabledReminders } from "@/constants/reminders";
import { getNextBillingDate } from "@/domain/billing";
import type { AppSettings, Subscription } from "@/domain/types";
import { formatFullDate } from "@/utils/dates";

const CHANNEL_ID = "subscription-reminders";
const PREFIX = "subtrack-reminder-";

let permissionPromise: Promise<boolean> | null = null;

export function notificationIdFor(subscriptionId: string): string {
  return `${PREFIX}${subscriptionId}`;
}

export function configureNotifications(): void {
  if (Platform.OS === "web") return;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });

  if (Platform.OS === "android") {
    Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: "Subscription reminders",
      importance: Notifications.AndroidImportance.DEFAULT,
      sound: "default",
      vibrationPattern: [0, 250, 250, 250],
    }).catch(() => {
      // Channel setup is best-effort; scheduling still works.
    });
  }
}

/**
 * Returns true when the user granted notification permission. Never throws,
 * and requests permission at most once per session.
 */
export async function ensureNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === "web") return false;
  if (permissionPromise) return permissionPromise;

  permissionPromise = (async () => {
    try {
      const current = await Notifications.getPermissionsAsync();
      if (current.granted) return true;
      if (!current.canAskAgain) return false;
      const requested = await Notifications.requestPermissionsAsync();
      return requested.granted;
    } catch {
      return false;
    }
  })();

  return permissionPromise;
}

export function resetPermissionCache(): void {
  permissionPromise = null;
}

/**
 * Schedules (or reschedules) the reminder notification for one subscription.
 * The notification fires `reminderDaysBefore` days before the effective next
 * billing date at 09:00 local time. If reminders are disabled or permission is
 * denied, any previously scheduled notification is cancelled.
 */
export async function scheduleSubscriptionReminder(
  subscription: Subscription,
  defaultReminderDays: number | null,
): Promise<void> {
  if (Platform.OS === "web") return;
  const id = notificationIdFor(subscription.id);

  if (subscription.status !== "active") {
    await cancelReminder(subscription.id);
    return;
  }

  const days = effectiveReminderDays(subscription.reminderDaysBefore, defaultReminderDays);
  if (days == null) {
    await cancelReminder(subscription.id);
    return;
  }

  const granted = await ensureNotificationPermissions();
  if (!granted) return;

  const renewal = getNextBillingDate(subscription);
  const fireDate = subDays(renewal, days);
  fireDate.setHours(9, 0, 0, 0);

  // Never schedule in the past (e.g. a same-day reminder for an overdue date).
  if (fireDate.getTime() <= Date.now()) {
    await cancelReminder(subscription.id);
    return;
  }

  const amount = minorToMajor(subscription.priceMinor, subscription.currency);
  const money = formatAmount(amount, subscription.currency);
  const relative = days === 0 ? "today" : days === 1 ? "tomorrow" : `in ${days} days`;

  await Notifications.scheduleNotificationAsync({
    identifier: id,
    content: {
      title: `${subscription.name} renews ${relative}`,
      body: `${money} will renew on ${formatFullDate(renewal)}.`,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: fireDate,
      channelId: CHANNEL_ID,
    },
  }).catch(() => {
    // Scheduling failures (e.g. permissions revoked) must not break the app.
  });
}

export async function cancelReminder(subscriptionId: string): Promise<void> {
  if (Platform.OS === "web") return;
  await Notifications.cancelScheduledNotificationAsync(notificationIdFor(subscriptionId)).catch(
    () => {
      // Best-effort.
    },
  );
}

/** Rebuilds every scheduled reminder to match the current data. */
export async function rescheduleAllReminders(
  subscriptions: Subscription[],
  settings: AppSettings,
): Promise<void> {
  if (Platform.OS === "web") return;
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    const managed = scheduled.filter((request) => request.identifier?.startsWith(PREFIX));
    await Promise.all(
      managed.map((request) => Notifications.cancelScheduledNotificationAsync(request.identifier)),
    );
  } catch {
    // If listing fails, cancel each known id below (no-op when absent).
  }

  if (!hasEnabledReminders(subscriptions, settings.defaultReminderDays)) return;

  const granted = await ensureNotificationPermissions();
  if (!granted) return;

  await Promise.all(
    subscriptions.map((subscription) =>
      scheduleSubscriptionReminder(subscription, settings.defaultReminderDays),
    ),
  );
}

export async function cancelAllReminders(): Promise<void> {
  if (Platform.OS === "web") return;
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    const managed = scheduled.filter((request) => request.identifier?.startsWith(PREFIX));
    await Promise.all(
      managed.map((request) => Notifications.cancelScheduledNotificationAsync(request.identifier)),
    );
  } catch {
    // Best-effort.
  }
}

function formatAmount(amount: number, currency: string): string {
  const formatter = new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
  });
  try {
    return formatter.format(amount);
  } catch {
    const info = getCurrencyInfo(currency);
    return `${info.symbol}${amount.toFixed(2)}`;
  }
}
