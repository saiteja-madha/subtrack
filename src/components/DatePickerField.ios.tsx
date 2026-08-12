import DateTimePicker from "@expo/ui/community/datetime-picker";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { FieldError } from "@/components/ui";
import { useAppTheme } from "@/theme";

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
  const { colors, dark } = useAppTheme();

  return (
    <View>
      <View style={styles.dateRow}>
        <Text style={[styles.label, { color: colors.text }]}>
          {label}
          {isRequired ? "  •" : ""}
        </Text>
        <View style={styles.controls}>
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
          <DateTimePicker
            value={value}
            mode="date"
            display="compact"
            minimumDate={minimumDate}
            maximumDate={maximumDate}
            accentColor={colors.primary}
            themeVariant={dark ? "dark" : "light"}
            onValueChange={(_event, date) => onChange(date)}
          />
        </View>
      </View>
      <FieldError>{errorMessage}</FieldError>
    </View>
  );
}

const styles = StyleSheet.create({
  dateRow: { minHeight: 44, flexDirection: "row", alignItems: "center", gap: 12 },
  label: { flex: 1, flexShrink: 1, fontSize: 16, fontWeight: "600" },
  controls: { flexShrink: 0, flexDirection: "row", alignItems: "center", gap: 10 },
  clear: { fontSize: 14, fontWeight: "700" },
});
