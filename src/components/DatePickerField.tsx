import DateTimePicker from "@expo/ui/community/datetime-picker";
import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { FieldError, FieldLabel } from "@/components/ui";
import { useAppTheme } from "@/theme";
import { formatFullDate } from "@/utils/dates";
export function DatePickerField({
  label,
  value,
  onChange,
  isRequired,
  minimumDate,
  maximumDate,
  errorMessage,
  onClear,
}: {
  label: string;
  value: Date;
  onChange: (date: Date) => void;
  isRequired?: boolean;
  minimumDate?: Date;
  maximumDate?: Date;
  errorMessage?: string;
  onClear?: () => void;
}) {
  const { colors } = useAppTheme();
  const [open, setOpen] = useState(false);
  return (
    <View>
      <View style={styles.labelRow}>
        <FieldLabel required={isRequired}>{label}</FieldLabel>
        {onClear ? (
          <Pressable
            onPress={onClear}
            accessibilityRole="button"
            accessibilityLabel={`Clear ${label}`}
            hitSlop={8}
          >
            <Text style={[styles.clear, { color: colors.primary }]}>Clear</Text>
          </Pressable>
        ) : null}
      </View>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityValue={{ text: formatFullDate(value) }}
        accessibilityHint={errorMessage}
        style={({ pressed }) => [
          styles.picker,
          {
            borderColor: colors.divider,
            backgroundColor: colors.surface,
            opacity: pressed ? 0.7 : 1,
          },
        ]}
      >
        <Text selectable style={[styles.value, { color: colors.text }]}>
          {formatFullDate(value)}
        </Text>
      </Pressable>
      {open ? (
        <DateTimePicker
          value={value}
          mode="date"
          presentation="dialog"
          minimumDate={minimumDate}
          maximumDate={maximumDate}
          accentColor={colors.primary}
          onValueChange={(_event, date) => {
            onChange(date);
            setOpen(false);
          }}
          onDismiss={() => setOpen(false)}
        />
      ) : null}
      <FieldError>{errorMessage}</FieldError>
    </View>
  );
}
const styles = StyleSheet.create({
  labelRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  clear: { fontSize: 14, fontWeight: "700", paddingBottom: 8 },
  picker: {
    minHeight: 50,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  value: { alignSelf: "flex-start", fontSize: 16 },
});
