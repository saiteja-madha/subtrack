import React, { useState } from "react";
import { formatISO } from "date-fns";

import { Host } from "@expo/ui";
import {
  Button,
  DatePicker,
  Form,
  HStack,
  Picker,
  Section,
  Spacer,
  Text,
  TextField,
  useNativeState,
} from "@expo/ui/swift-ui";
import {
  buttonStyle,
  controlSize,
  datePickerStyle,
  disabled,
  dynamicTypeSize,
  font,
  keyboardType,
  lineLimit,
  listRowBackground,
  pickerStyle,
  tag,
  tint,
} from "@expo/ui/swift-ui/modifiers";

import { CURRENCIES } from "@/constants/currencies";
import { SUBSCRIPTION_REMINDER_OPTIONS } from "@/constants/reminders";
import {
  BILLING_CYCLE_PRESETS,
  CUSTOM_UNITS,
  validateSubscriptionForm,
  type BillingCyclePreset,
  type FormErrors,
  type SubscriptionDraft,
  type SubscriptionFormValues,
} from "@/domain/subscription";
import type { BillingUnit, Category, SubscriptionStatus } from "@/domain/types";
import { useAppTheme } from "@/theme";

const TODAY_ISO = formatISO(new Date(), { representation: "date" });
const NONE_CATEGORY = "__none__";
const DEFAULT_REMINDER = "__default__";

const STATUS_OPTIONS: Array<{ value: SubscriptionStatus; label: string }> = [
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

function toDate(value: string): Date {
  return new Date(`${value}T00:00:00`);
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
  const { colors, dark } = useAppTheme();
  const initialValues = initial ?? emptyForm(defaultCurrency);
  const [values, setValues] = useState<SubscriptionFormValues>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const name = useNativeState(initialValues.name);
  const price = useNativeState(initialValues.price);
  const customInterval = useNativeState(initialValues.customInterval);
  const notes = useNativeState(initialValues.notes);

  const set = <K extends keyof SubscriptionFormValues>(
    key: K,
    value: SubscriptionFormValues[K],
  ) => {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      if (!current[key]) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
  };

  const updateText =
    <K extends "name" | "price" | "customInterval" | "notes">(key: K) =>
    (text: string) =>
      set(key, text);

  const submit = () => {
    const result = validateSubscriptionForm({
      ...values,
      name: name.get(),
      price: price.get(),
      customInterval: customInterval.get(),
      notes: notes.get(),
    });
    if (result.draft) {
      setErrors({});
      onSubmit(result.draft);
    } else {
      setErrors(result.errors);
    }
  };

  const validationMessage = Object.values(errors).filter(Boolean).join(" · ");
  const nextMinimum = values.startDate ? toDate(values.startDate) : new Date();
  const firstBilledDate = values.startDate
    ? toDate(values.startDate)
    : toDate(values.nextBillingDate);

  return (
    <Host
      style={{ flex: 1 }}
      colorScheme={dark ? "dark" : "light"}
      seedColor={colors.primary}
      useViewportSizeMeasurement
    >
      <Form modifiers={[font({ size: 15 }), dynamicTypeSize("medium")]}>
        <Section title="Subscription">
          <TextField
            text={name}
            placeholder="Name"
            maxLength={80}
            onTextChange={updateText("name")}
          />
        </Section>

        <Section title="Pricing">
          <TextField
            text={price}
            placeholder="Amount"
            onTextChange={updateText("price")}
            modifiers={[keyboardType("decimal-pad")]}
          />
          <Picker
            label="Currency"
            selection={values.currency}
            onSelectionChange={(currency) => set("currency", currency)}
            modifiers={[pickerStyle("menu")]}
          >
            {CURRENCIES.map((currency) => (
              <Text key={currency.code} modifiers={[tag(currency.code)]}>
                {currency.code} · {currency.name}
              </Text>
            ))}
          </Picker>
          <Picker
            label="Billing cycle"
            selection={values.cycle}
            onSelectionChange={(cycle) => set("cycle", cycle as BillingCyclePreset)}
            modifiers={[pickerStyle("menu")]}
          >
            {BILLING_CYCLE_PRESETS.map((cycle) => (
              <Text key={cycle.value} modifiers={[tag(cycle.value)]}>
                {cycle.label}
              </Text>
            ))}
          </Picker>
          {values.cycle === "custom" ? (
            <>
              <TextField
                text={customInterval}
                placeholder="Every"
                onTextChange={updateText("customInterval")}
                modifiers={[keyboardType("numeric")]}
              />
              <Picker
                label="Unit"
                selection={values.customUnit}
                onSelectionChange={(unit) => set("customUnit", unit as BillingUnit)}
                modifiers={[pickerStyle("menu")]}
              >
                {CUSTOM_UNITS.map((unit) => (
                  <Text key={unit.value} modifiers={[tag(unit.value)]}>
                    {unit.label}
                  </Text>
                ))}
              </Picker>
            </>
          ) : null}
        </Section>

        <Section title="Dates">
          <DatePicker
            title="Next payment"
            selection={toDate(values.nextBillingDate)}
            range={{ start: nextMinimum }}
            onDateChange={(date) =>
              set("nextBillingDate", formatISO(date, { representation: "date" }))
            }
            modifiers={[datePickerStyle("compact")]}
          />
          <DatePicker
            title="First billed"
            selection={firstBilledDate}
            range={{ end: new Date() }}
            onDateChange={(date) => set("startDate", formatISO(date, { representation: "date" }))}
            modifiers={[datePickerStyle("compact")]}
          />
          {values.startDate ? (
            <Button label="Clear first billed" onPress={() => set("startDate", null)} />
          ) : null}
        </Section>

        <Section title="Organization">
          <Picker
            label="Category"
            selection={values.categoryId ?? NONE_CATEGORY}
            onSelectionChange={(categoryId) =>
              set("categoryId", categoryId === NONE_CATEGORY ? null : categoryId)
            }
            modifiers={[pickerStyle("menu")]}
          >
            <Text modifiers={[tag(NONE_CATEGORY)]}>None</Text>
            {categories.map((category) => (
              <Text key={category.id} modifiers={[tag(category.id)]}>
                {category.name}
              </Text>
            ))}
          </Picker>
        </Section>

        <Section title="Reminder">
          <Picker
            label="Notify me"
            selection={
              values.reminderDaysBefore == null
                ? DEFAULT_REMINDER
                : String(values.reminderDaysBefore)
            }
            onSelectionChange={(reminder) =>
              set(
                "reminderDaysBefore",
                reminder === DEFAULT_REMINDER ? null : Number.parseInt(reminder, 10),
              )
            }
            modifiers={[pickerStyle("menu")]}
          >
            {SUBSCRIPTION_REMINDER_OPTIONS.map((option) => {
              const value = option.value == null ? DEFAULT_REMINDER : String(option.value);
              return (
                <Text key={value} modifiers={[tag(value)]}>
                  {option.label}
                </Text>
              );
            })}
          </Picker>
        </Section>

        {showStatus ? (
          <Section title="Status">
            <Picker
              label="Subscription status"
              selection={values.status}
              onSelectionChange={(status) => set("status", status as SubscriptionStatus)}
              modifiers={[pickerStyle("segmented")]}
            >
              {STATUS_OPTIONS.map((status) => (
                <Text key={status.value} modifiers={[tag(status.value)]}>
                  {status.label}
                </Text>
              ))}
            </Picker>
          </Section>
        ) : null}

        <Section title="Notes">
          <TextField
            text={notes}
            placeholder="Anything to remember…"
            axis="vertical"
            onTextChange={updateText("notes")}
            modifiers={[lineLimit(4, { reservesSpace: true })]}
          />
        </Section>

        <HStack modifiers={[listRowBackground("clear")]}>
          {validationMessage ? <Text>{validationMessage}</Text> : null}
          <Spacer />
          <Button
            label={isSubmitting ? "Saving…" : submitLabel}
            onPress={submit}
            modifiers={[
              buttonStyle("borderedProminent"),
              controlSize("regular"),
              tint(colors.primary),
              disabled(isSubmitting),
            ]}
          />
        </HStack>
      </Form>
    </Host>
  );
}
