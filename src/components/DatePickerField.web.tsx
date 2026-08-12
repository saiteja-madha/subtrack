import React from "react";
import { StyleSheet, View } from "react-native";
import { AppTextInput, FieldError, FieldLabel } from "@/components/ui";
import { formatISO } from "date-fns";
export function DatePickerField({
  label,
  value,
  onChange,
  isRequired,
  minimumDate,
  maximumDate,
  errorMessage,
}: {
  label: string;
  value: Date;
  onChange: (date: Date) => void;
  isRequired?: boolean;
  minimumDate?: Date;
  maximumDate?: Date;
  errorMessage?: string;
}) {
  const iso = formatISO(value, { representation: "date" });
  return (
    <View>
      <FieldLabel required={isRequired}>{label}</FieldLabel>
      <AppTextInput
        value={iso}
        aria-label={label} // @ts-expect-error React Native Web forwards these native input attributes
        type="date"
        min={minimumDate ? formatISO(minimumDate, { representation: "date" }) : undefined}
        max={maximumDate ? formatISO(maximumDate, { representation: "date" }) : undefined}
        onChangeText={(text) => {
          const date = new Date(`${text}T00:00:00`);
          if (!Number.isNaN(date.getTime())) onChange(date);
        }}
        style={styles.input}
      />
      <FieldError>{errorMessage}</FieldError>
    </View>
  );
}
const styles = StyleSheet.create({ input: { minWidth: 180 } });
