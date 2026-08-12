import React, { useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Divider, FieldError, FieldLabel, GlassSurface } from "@/components/ui";
import { Icon, type IconName } from "@/components/Icon";
import { useAppTheme } from "@/theme";

export interface SelectFieldOption {
  value: string;
  label: string;
  icon?: IconName;
}

interface SelectFieldProps {
  label: string;
  options: SelectFieldOption[];
  value: string | null;
  onChange: (value: string | null) => void;
  placeholder?: string;
  noneLabel?: string;
  isRequired?: boolean;
  errorMessage?: string;
}

export function SelectField({
  label,
  options,
  value,
  onChange,
  placeholder = "Select…",
  noneLabel,
  isRequired,
  errorMessage,
}: SelectFieldProps) {
  const [open, setOpen] = useState(false);
  const { colors } = useAppTheme();
  const selected = options.find((option) => option.value === value);
  const all = noneLabel
    ? [{ value: "__none__", label: noneLabel } as SelectFieldOption, ...options]
    : options;
  return (
    <View>
      <FieldLabel required={isRequired}>{label}</FieldLabel>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityValue={{
          text: selected?.label ?? (value === null && noneLabel ? noneLabel : placeholder),
        }}
        accessibilityState={{ expanded: open }}
        accessibilityHint={errorMessage}
        style={({ pressed }) => [
          styles.trigger,
          {
            backgroundColor: colors.surface,
            borderColor: colors.divider,
            opacity: pressed ? 0.72 : 1,
          },
        ]}
      >
        <Text style={[styles.triggerText, { color: selected ? colors.text : colors.textMuted }]}>
          {selected?.label ?? (value === null && noneLabel ? noneLabel : placeholder)}
        </Text>
        <Icon name="chevron-down" size={18} color={colors.textMuted} />
      </Pressable>
      <FieldError>{errorMessage}</FieldError>
      <Modal transparent visible={open} animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable style={styles.sheetWrap} onPress={() => {}} accessibilityViewIsModal>
            <GlassSurface style={styles.sheet}>
              <Text style={[styles.title, { color: colors.text }]}>{label}</Text>
              <ScrollView style={styles.options} contentContainerStyle={styles.optionsContent}>
                {all.map((option, index) => {
                  const actual = option.value === "__none__" ? null : option.value;
                  const active = actual === value;
                  return (
                    <React.Fragment key={option.value}>
                      <Pressable
                        onPress={() => {
                          onChange(actual);
                          setOpen(false);
                        }}
                        style={({ pressed }) => [styles.option, { opacity: pressed ? 0.6 : 1 }]}
                        accessibilityRole="radio"
                        accessibilityLabel={option.label}
                        accessibilityState={{ checked: active }}
                      >
                        {option.icon ? (
                          <Icon
                            name={option.icon}
                            size={18}
                            color={active ? colors.primary : colors.textMuted}
                          />
                        ) : null}
                        <Text
                          style={[
                            styles.optionText,
                            { color: active ? colors.primary : colors.text },
                          ]}
                        >
                          {option.label}
                        </Text>
                        {active ? (
                          <Icon name="checkmark-circle" size={21} color={colors.primary} />
                        ) : null}
                      </Pressable>
                      {index < all.length - 1 ? <Divider /> : null}
                    </React.Fragment>
                  );
                })}
              </ScrollView>
            </GlassSurface>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  trigger: {
    minHeight: 50,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  triggerText: { fontSize: 16 },
  backdrop: { flex: 1, backgroundColor: "rgba(2,6,18,.5)", justifyContent: "flex-end" },
  sheetWrap: { width: "100%", maxWidth: 640, alignSelf: "center", padding: 12 },
  sheet: { padding: 18, maxHeight: "75%" },
  title: { fontSize: 20, fontWeight: "800", marginBottom: 10 },
  options: { flexShrink: 1 },
  optionsContent: { paddingBottom: 4 },
  option: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 4,
  },
  optionText: { flex: 1, fontSize: 16, fontWeight: "600" },
});
