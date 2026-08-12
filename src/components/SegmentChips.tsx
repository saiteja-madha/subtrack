import React from "react";
import { ScrollView, Pressable, StyleSheet, Text } from "react-native";
import { useAppTheme } from "@/theme";
export interface SegmentOption {
  value: string;
  label: string;
}
export function SegmentChips({
  options,
  value,
  onChange,
  noneLabel,
  groupLabel,
}: {
  options: SegmentOption[];
  value: string | null;
  onChange: (value: string | null) => void;
  noneLabel?: string;
  groupLabel?: string;
  size?: "sm" | "md" | "lg";
}) {
  const { colors } = useAppTheme();
  const all = noneLabel ? [{ value: "__none__", label: noneLabel }, ...options] : options;
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      accessibilityRole="radiogroup"
      accessibilityLabel={groupLabel}
    >
      {all.map((option) => {
        const actual = option.value === "__none__" ? null : option.value;
        const selected = value === actual;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(actual)}
            style={({ pressed }) => [
              styles.chip,
              {
                backgroundColor: selected ? colors.primary : colors.surfaceMuted,
                borderColor: selected ? colors.primary : colors.divider,
                opacity: pressed ? 0.72 : 1,
              },
            ]}
            accessibilityRole="radio"
            accessibilityLabel={groupLabel ? `${groupLabel}, ${option.label}` : option.label}
            accessibilityState={{ checked: selected }}
          >
            <Text
              style={[styles.label, { color: selected ? colors.onPrimary : colors.textSecondary }]}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  row: { gap: 8, paddingVertical: 2 },
  chip: {
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: 13,
    borderRadius: 999,
    borderWidth: 1,
  },
  label: { fontSize: 13, fontWeight: "600" },
});
