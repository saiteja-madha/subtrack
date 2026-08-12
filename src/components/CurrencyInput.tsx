import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { AppTextInput, FieldError, FieldLabel } from "@/components/ui";
import { getCurrencyInfo } from "@/constants/currencies";
import { useAppTheme } from "@/theme";
export function CurrencyInput({
  label,
  currency,
  value,
  onChangeText,
  isRequired,
  errorMessage,
  placeholder = "0.00",
}: {
  label: string;
  currency: string;
  value: string;
  onChangeText: (text: string) => void;
  isRequired?: boolean;
  isInvalid?: boolean;
  errorMessage?: string;
  placeholder?: string;
}) {
  const { colors } = useAppTheme();
  return (
    <View>
      <FieldLabel required={isRequired}>{label}</FieldLabel>
      <View>
        <View pointerEvents="none" style={styles.symbolWrap}>
          <Text style={[styles.symbol, { color: colors.textMuted }]}>
            {getCurrencyInfo(currency).symbol}
          </Text>
        </View>
        <AppTextInput
          style={styles.input}
          value={value}
          onChangeText={(raw) => onChangeText(raw.replace(/[^\d.,]/g, "").replace(/,/g, ""))}
          placeholder={placeholder}
          keyboardType="decimal-pad"
          inputMode="decimal"
          maxLength={14}
        />
      </View>
      <FieldError>{errorMessage}</FieldError>
    </View>
  );
}
const styles = StyleSheet.create({
  symbolWrap: {
    position: "absolute",
    left: 14,
    top: 0,
    bottom: 0,
    zIndex: 1,
    justifyContent: "center",
  },
  symbol: { fontSize: 16, fontWeight: "600" },
  input: { paddingLeft: 35 },
});
