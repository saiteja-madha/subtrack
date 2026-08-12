import React from "react";
import { StyleSheet, View } from "react-native";
import { AppTextInput, FieldError, FieldLabel } from "@/components/ui";
import { SegmentChips } from "@/components/SegmentChips";
import {
  BILLING_CYCLE_PRESETS,
  CUSTOM_UNITS,
  type BillingCyclePreset,
} from "@/domain/subscription";
import type { BillingUnit } from "@/domain/types";
export function BillingCyclePicker({
  cycle,
  customInterval,
  customUnit,
  onCycleChange,
  onCustomIntervalChange,
  onCustomUnitChange,
  errorMessage,
}: {
  cycle: BillingCyclePreset;
  customInterval: string;
  customUnit: BillingUnit;
  onCycleChange: (cycle: BillingCyclePreset) => void;
  onCustomIntervalChange: (interval: string) => void;
  onCustomUnitChange: (unit: BillingUnit) => void;
  errorMessage?: string;
}) {
  return (
    <View>
      <FieldLabel>Billing cycle</FieldLabel>
      <SegmentChips
        options={BILLING_CYCLE_PRESETS}
        value={cycle}
        groupLabel="Billing cycle"
        onChange={(v) => onCycleChange((v as BillingCyclePreset) ?? "monthly")}
      />
      {cycle === "custom" ? (
        <View style={styles.custom}>
          <View>
            <FieldLabel>Every</FieldLabel>
            <AppTextInput
              value={customInterval}
              onChangeText={onCustomIntervalChange}
              keyboardType="number-pad"
              inputMode="numeric"
              placeholder="e.g. 6"
              accessibilityLabel="Billing cycle interval"
            />
            <FieldError>{errorMessage}</FieldError>
          </View>
          <View>
            <FieldLabel>Unit</FieldLabel>
            <SegmentChips
              options={CUSTOM_UNITS}
              value={customUnit}
              groupLabel="Billing cycle unit"
              onChange={(v) => onCustomUnitChange((v as BillingUnit) ?? "month")}
            />
          </View>
        </View>
      ) : null}
    </View>
  );
}
const styles = StyleSheet.create({ custom: { gap: 16, marginTop: 16 } });
