import React from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type PressableProps,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from "react-native";
import { BlurView } from "expo-blur";
import { GlassView, isGlassEffectAPIAvailable } from "expo-glass-effect";

import { elevation, radii, useAppTheme } from "@/theme";

export function GlassSurface({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const { colors, dark } = useAppTheme();
  const surfaceStyle = [
    styles.glass,
    { backgroundColor: colors.glass, borderColor: colors.glassBorder },
    elevation,
    style,
  ];
  if (Platform.OS === "ios" && isGlassEffectAPIAvailable()) {
    return (
      <GlassView
        style={surfaceStyle}
        glassEffectStyle="regular"
        colorScheme={dark ? "dark" : "light"}
      >
        {children}
      </GlassView>
    );
  }
  return (
    <BlurView
      intensity={Platform.OS === "web" ? 35 : 22}
      tint={dark ? "dark" : "light"}
      style={surfaceStyle}
    >
      {children}
    </BlurView>
  );
}

type ButtonTone = "primary" | "secondary" | "ghost" | "danger";
export function AppButton({
  label,
  tone = "primary",
  icon,
  compact,
  loading,
  style,
  disabled,
  ...props
}: PressableProps & {
  label?: string;
  tone?: ButtonTone;
  icon?: React.ReactNode;
  compact?: boolean;
  loading?: boolean;
}) {
  const { colors, dark } = useAppTheme();
  const bg =
    tone === "primary"
      ? colors.primary
      : tone === "danger"
        ? colors.dangerSoft
        : tone === "secondary"
          ? colors.surfaceMuted
          : "transparent";
  const buttonBg = tone === "danger" ? colors.danger : bg;
  const fg =
    tone === "primary"
      ? colors.onPrimary
      : tone === "danger"
        ? dark
          ? "#2A0B12"
          : "#FFFFFF"
        : tone === "secondary"
          ? colors.text
          : colors.primary;
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        compact && styles.buttonCompact,
        {
          backgroundColor: pressed && tone === "primary" ? colors.primaryPressed : buttonBg,
          borderColor: tone === "secondary" ? colors.divider : "transparent",
          opacity: disabled ? 0.45 : pressed ? 0.82 : 1,
        },
        style as StyleProp<ViewStyle>,
      ]}
      {...props}
    >
      {loading ? <ActivityIndicator size="small" color={fg} /> : icon}
      {label ? <Text style={[styles.buttonLabel, { color: fg }]}>{label}</Text> : null}
    </Pressable>
  );
}

export function FieldLabel({
  children,
  required,
}: {
  children: React.ReactNode;
  required?: boolean;
}) {
  const { colors } = useAppTheme();
  return (
    <Text style={[styles.label, { color: colors.textSecondary }]}>
      {children}
      {required ? "  •" : ""}
    </Text>
  );
}

export function FieldError({ children }: { children?: React.ReactNode }) {
  const { colors } = useAppTheme();
  return children ? <Text style={[styles.error, { color: colors.danger }]}>{children}</Text> : null;
}

export function AppTextInput({ style, multiline, ...props }: TextInputProps) {
  const { colors } = useAppTheme();
  return (
    <TextInput
      placeholderTextColor={colors.textMuted}
      selectionColor={colors.primary}
      multiline={multiline}
      style={[
        styles.input,
        multiline && styles.multiline,
        { color: colors.text, backgroundColor: colors.surface, borderColor: colors.divider },
        style,
      ]}
      {...props}
    />
  );
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  const { colors } = useAppTheme();
  return <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>{children}</Text>;
}

export function Divider({ inset = 0 }: { inset?: number }) {
  const { colors } = useAppTheme();
  return (
    <View
      style={{
        height: StyleSheet.hairlineWidth,
        backgroundColor: colors.divider,
        marginHorizontal: inset,
      }}
    />
  );
}

const styles = StyleSheet.create({
  glass: { borderRadius: radii.lg, borderWidth: 1, overflow: "hidden" },
  button: {
    minHeight: 48,
    borderRadius: radii.md,
    borderWidth: 1,
    paddingHorizontal: 18,
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonCompact: { minHeight: 38, paddingHorizontal: 12, borderRadius: 12 },
  buttonLabel: { fontSize: 15, fontWeight: "700", letterSpacing: 0.1 },
  label: { fontSize: 13, fontWeight: "600", marginBottom: 8 },
  error: { fontSize: 12, marginTop: 6 },
  input: {
    minHeight: 50,
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: 14,
    fontSize: 16,
  },
  multiline: { minHeight: 96, paddingTop: 14, textAlignVertical: "top" },
  sectionLabel: { fontSize: 12, fontWeight: "700", letterSpacing: 1.1, textTransform: "uppercase" },
});
