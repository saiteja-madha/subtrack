import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { formatISO } from "date-fns";

import { BillingCyclePicker } from "@/components/BillingCyclePicker";
import { CurrencyInput } from "@/components/CurrencyInput";
import { DatePickerField } from "@/components/DatePickerField";
import { SegmentChips } from "@/components/SegmentChips";
import { SelectField } from "@/components/SelectField";
import type { IconName } from "@/components/Icon";
import {
  AppButton,
  AppTextInput,
  FieldError,
  FieldLabel,
  SectionLabel,
  SurfaceCard,
} from "@/components/ui";
import { CURRENCIES } from "@/constants/currencies";
import { SUBSCRIPTION_REMINDER_OPTIONS } from "@/constants/reminders";
import {
  validateSubscriptionForm,
  type FormErrors,
  type SubscriptionDraft,
  type SubscriptionFormValues,
} from "@/domain/subscription";
import type { Category, SubscriptionStatus } from "@/domain/types";

const TODAY_ISO = formatISO(new Date(), { representation: "date" });
const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "paused", label: "Paused" },
  { value: "cancelled", label: "Cancelled" },
];
function emptyForm(defaultCurrency: string): SubscriptionFormValues {
  return {
    name: "",
    price: "",
    currency: defaultCurrency,
    cycle: "monthly",
    customInterval: "1",
    customUnit: "month",
    nextBillingDate: TODAY_ISO,
    categoryId: null,
    startDate: null,
    reminderDaysBefore: null,
    notes: "",
    status: "active",
  };
}

export function SubscriptionForm({
  initial,
  defaultCurrency,
  categories,
  isSubmitting = false,
  showStatus = false,
  submitLabel = "Save subscription",
  onSubmit,
}: {
  initial?: SubscriptionFormValues;
  defaultCurrency: string;
  categories: Category[];
  isSubmitting?: boolean;
  showStatus?: boolean;
  submitLabel?: string;
  onSubmit: (draft: SubscriptionDraft) => void;
}) {
  const [values, setValues] = useState<SubscriptionFormValues>(
    () => initial ?? emptyForm(defaultCurrency),
  );
  const [errors, setErrors] = useState<FormErrors>({});
  const set = <K extends keyof SubscriptionFormValues>(
    key: K,
    value: SubscriptionFormValues[K],
  ) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };
  const submit = () => {
    const result = validateSubscriptionForm(values);
    if (result.draft) {
      setErrors({});
      onSubmit(result.draft);
    } else setErrors(result.errors);
  };
  const nextMin = values.startDate ? new Date(`${values.startDate}T00:00:00`) : new Date();
  return (
    <View style={styles.form}>
      <SurfaceCard style={styles.card}>
        <View>
          <FieldLabel required>Name</FieldLabel>
          <AppTextInput
            value={values.name}
            onChangeText={(text) => set("name", text)}
            placeholder="e.g. Netflix"
            autoCapitalize="words"
            accessibilityLabel="Name"
            accessibilityHint={errors.name}
          />
          <FieldError>{errors.name}</FieldError>
        </View>
      </SurfaceCard>
      <Section title="Pricing">
        <CurrencyInput
          label="Amount"
          currency={values.currency}
          value={values.price}
          onChangeText={(text) => set("price", text)}
          isRequired
          errorMessage={errors.price}
        />
        <SelectField
          label="Currency"
          options={CURRENCIES.map((c) => ({ value: c.code, label: `${c.code} · ${c.name}` }))}
          value={values.currency}
          onChange={(v) => set("currency", v ?? "USD")}
        />
        <BillingCyclePicker
          cycle={values.cycle}
          customInterval={values.customInterval}
          customUnit={values.customUnit}
          onCycleChange={(v) => set("cycle", v)}
          onCustomIntervalChange={(v) => set("customInterval", v)}
          onCustomUnitChange={(v) => set("customUnit", v)}
          errorMessage={errors.customInterval}
        />
      </Section>
      <Section title="Dates">
        <DatePickerField
          label="Next payment"
          value={new Date(`${values.nextBillingDate}T00:00:00`)}
          onChange={(d) => set("nextBillingDate", formatISO(d, { representation: "date" }))}
          isRequired
          minimumDate={nextMin}
          errorMessage={errors.nextBillingDate}
        />
        <DatePickerField
          label="First billed (optional)"
          value={
            values.startDate
              ? new Date(`${values.startDate}T00:00:00`)
              : new Date(`${values.nextBillingDate}T00:00:00`)
          }
          onChange={(d) => set("startDate", formatISO(d, { representation: "date" }))}
          maximumDate={new Date()}
          onClear={values.startDate ? () => set("startDate", null) : undefined}
        />
      </Section>
      <Section title="Organization">
        <SelectField
          label="Category"
          options={categories.map((c) => ({
            value: c.id,
            label: c.name,
            icon: c.icon as IconName,
          }))}
          value={values.categoryId}
          onChange={(v) => set("categoryId", v)}
          placeholder="Choose a category"
          noneLabel="None"
        />
      </Section>
      <Section title="Reminder">
        <SelectField
          label="Notify me"
          options={SUBSCRIPTION_REMINDER_OPTIONS.map((o) => ({
            value: o.value == null ? "default" : String(o.value),
            label: o.label,
          }))}
          value={values.reminderDaysBefore == null ? "default" : String(values.reminderDaysBefore)}
          onChange={(v) =>
            set("reminderDaysBefore", v == null || v === "default" ? null : parseInt(v, 10))
          }
        />
      </Section>
      {showStatus ? (
        <Section title="Status">
          <View>
            <FieldLabel>Subscription status</FieldLabel>
            <SegmentChips
              options={STATUS_OPTIONS}
              value={values.status}
              groupLabel="Subscription status"
              onChange={(v) => set("status", (v as SubscriptionStatus) ?? "active")}
            />
          </View>
        </Section>
      ) : null}
      <SurfaceCard style={styles.card}>
        <FieldLabel>Notes (optional)</FieldLabel>
        <AppTextInput
          value={values.notes}
          onChangeText={(text) => set("notes", text)}
          placeholder="Anything to remember…"
          multiline
          numberOfLines={3}
          accessibilityLabel="Notes"
        />
      </SurfaceCard>
      <AppButton label={submitLabel} loading={isSubmitting} onPress={submit} />
    </View>
  );
}
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <SectionLabel>{title}</SectionLabel>
      <SurfaceCard style={styles.card}>
        <View style={styles.fields}>{children}</View>
      </SurfaceCard>
    </View>
  );
}
const styles = StyleSheet.create({
  form: {
    gap: 24,
    paddingHorizontal: 20,
    paddingVertical: 20,
    width: "100%",
    maxWidth: 720,
    alignSelf: "center",
    paddingBottom: 48,
  },
  section: { gap: 10 },
  card: { padding: 18 },
  fields: { gap: 18 },
});
