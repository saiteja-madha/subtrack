import { Icon, type IconName } from "@/components/Icon";
import { Divider, FieldError, FieldLabel, GlassSurface } from "@/components/ui";
import { useAppTheme } from "@/theme";
import { MenuView } from "@expo/ui/community/menu";
import React, { useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

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
  variant?: "field" | "settings";
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
  variant = "field",
}: SelectFieldProps) {
  const [open, setOpen] = useState(false);
  const { colors } = useAppTheme();
  const selected = options.find((option) => option.value === value);
  const all = noneLabel
    ? [{ value: "__none__", label: noneLabel } as SelectFieldOption, ...options]
    : options;
  const selectedLabel = selected?.label ?? (value === null && noneLabel ? noneLabel : placeholder);
  const trigger =
    variant === "settings" ? (
      <View
        style={styles.settingsTrigger}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityValue={{ text: selectedLabel }}
        accessibilityHint={errorMessage}
      >
        <Text style={[styles.settingsLabel, { color: colors.text }]}>{label}</Text>
        <View style={styles.settingsValueWrap}>
          <Text
            numberOfLines={1}
            style={[
              styles.settingsValue,
              { color: selected ? colors.textSecondary : colors.textMuted },
            ]}
          >
            {selectedLabel}
          </Text>
          <Icon name="chevron-forward" size={16} color={colors.textMuted} />
        </View>
      </View>
    ) : (
      <View
        style={[styles.trigger, { backgroundColor: colors.surface, borderColor: colors.divider }]}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityValue={{
          text: selectedLabel,
        }}
        accessibilityHint={errorMessage}
      >
        <Text style={[styles.triggerText, { color: selected ? colors.text : colors.textMuted }]}>
          {selectedLabel}
        </Text>
        <Icon name="chevron-down" size={18} color={colors.textMuted} />
      </View>
    );
  return (
    <View>
      {variant === "field" ? <FieldLabel required={isRequired}>{label}</FieldLabel> : null}
      {process.env.EXPO_OS === "web" ? (
        <Pressable onPress={() => setOpen(true)} accessibilityState={{ expanded: open }}>
          {trigger}
        </Pressable>
      ) : (
        <MenuView
          title={label}
          actions={all.map((option) => ({
            id: option.value,
            title: option.label,
            state: (option.value === "__none__" ? null : option.value) === value ? "on" : "off",
          }))}
          onPressAction={({ nativeEvent }) => {
            onChange(nativeEvent.event === "__none__" ? null : nativeEvent.event);
          }}
        >
          {trigger}
        </MenuView>
      )}
      {variant === "field" ? <FieldError>{errorMessage}</FieldError> : null}
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
  settingsTrigger: {
    minHeight: 52,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },
  settingsLabel: { flex: 1, fontSize: 16 },
  settingsValueWrap: { flexDirection: "row", alignItems: "center", gap: 6, maxWidth: "62%" },
  settingsValue: { flexShrink: 1, fontSize: 16, textAlign: "right" },
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
