import React, { useState } from "react";
import { Modal, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import DateTimePicker, { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import { AppButton, FieldError, FieldLabel, GlassSurface } from "@/components/ui";
import { Icon } from "@/components/Icon";
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
}: {
  label: string;
  value: Date;
  onChange: (date: Date) => void;
  isRequired?: boolean;
  minimumDate?: Date;
  maximumDate?: Date;
  errorMessage?: string;
}) {
  const { colors } = useAppTheme();
  const [show, setShow] = useState(false);
  const open = () => {
    if (Platform.OS === "android")
      DateTimePickerAndroid.open({
        value,
        mode: "date",
        minimumDate,
        maximumDate,
        onChange: (_e, d) => d && onChange(d),
      });
    else setShow(true);
  };
  return (
    <View>
      <FieldLabel required={isRequired}>{label}</FieldLabel>
      <Pressable
        onPress={open}
        style={({ pressed }) => [
          styles.trigger,
          {
            backgroundColor: colors.surface,
            borderColor: colors.divider,
            opacity: pressed ? 0.7 : 1,
          },
        ]}
      >
        <Text style={[styles.value, { color: colors.text }]}>{formatFullDate(value)}</Text>
        <Icon name="calendar-outline" size={20} color={colors.primary} />
      </Pressable>
      {Platform.OS === "ios" && show ? (
        <Modal transparent animationType="fade" onRequestClose={() => setShow(false)}>
          <Pressable style={styles.backdrop} onPress={() => setShow(false)}>
            <Pressable style={styles.sheetWrap} onPress={() => {}}>
              <GlassSurface style={styles.sheet}>
                <View style={styles.header}>
                  <Text style={[styles.title, { color: colors.text }]}>{label}</Text>
                  <AppButton compact label="Done" onPress={() => setShow(false)} />
                </View>
                <DateTimePicker
                  value={value}
                  mode="date"
                  display="spinner"
                  minimumDate={minimumDate}
                  maximumDate={maximumDate}
                  onChange={(_e, d) => d && onChange(d)}
                />
              </GlassSurface>
            </Pressable>
          </Pressable>
        </Modal>
      ) : null}
      <FieldError>{errorMessage}</FieldError>
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
  value: { fontSize: 16 },
  backdrop: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(2,6,18,.5)" },
  sheetWrap: { padding: 12 },
  sheet: { padding: 18 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  title: { fontSize: 19, fontWeight: "800" },
});
