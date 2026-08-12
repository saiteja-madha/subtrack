const shortFormatter = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
});

const fullFormatter = new Intl.DateTimeFormat(undefined, {
  year: "numeric",
  month: "short",
  day: "numeric",
});

const weekdayFormatter = new Intl.DateTimeFormat(undefined, {
  weekday: "short",
  month: "short",
  day: "numeric",
});

export function formatShortDate(date: Date | string): string {
  return shortFormatter.format(typeof date === "string" ? parseISO(date) : date);
}

export function formatFullDate(date: Date | string): string {
  return fullFormatter.format(typeof date === "string" ? parseISO(date) : date);
}

export function formatWeekdayDate(date: Date | string): string {
  return weekdayFormatter.format(typeof date === "string" ? parseISO(date) : date);
}

export function isToday(date: Date): boolean {
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

export function isTomorrow(date: Date): boolean {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return (
    date.getFullYear() === tomorrow.getFullYear() &&
    date.getMonth() === tomorrow.getMonth() &&
    date.getDate() === tomorrow.getDate()
  );
}
import { parseISO } from "date-fns";
