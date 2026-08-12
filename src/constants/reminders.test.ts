import { describe, expect, it } from "vitest";

import { effectiveReminderDays, hasEnabledReminders } from "@/constants/reminders";

describe("subscription reminders", () => {
  it("distinguishes inherited defaults from explicit off", () => {
    expect(effectiveReminderDays(null, 3)).toBe(3);
    expect(effectiveReminderDays(-1, 3)).toBeNull();
  });

  it("only reports reminders that can actually schedule", () => {
    expect(hasEnabledReminders([], 3)).toBe(false);
    expect(hasEnabledReminders([{ status: "active", reminderDaysBefore: null }], null)).toBe(false);
    expect(hasEnabledReminders([{ status: "active", reminderDaysBefore: -1 }], 3)).toBe(false);
    expect(hasEnabledReminders([{ status: "paused", reminderDaysBefore: 1 }], 3)).toBe(false);
    expect(hasEnabledReminders([{ status: "active", reminderDaysBefore: null }], 3)).toBe(true);
  });
});
