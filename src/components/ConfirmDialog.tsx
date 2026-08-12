import { BottomSheet, RNHostView } from "@expo/ui";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

import { useAppTheme } from "@/theme";
export function ConfirmDialog({
  isOpen,
  onOpenChange,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "default",
  isLoading = false,
  onConfirm,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "default" | "danger";
  isLoading?: boolean;
  onConfirm: () => void;
}) {
  const { colors, dark } = useAppTheme();
  return (
    <BottomSheet
      isPresented={isOpen}
      onDismiss={() => onOpenChange(false)}
      showDragIndicator
      snapPoints={process.env.EXPO_OS === "android" ? undefined : [{ height: 320 }]}
    >
      <RNHostView matchContents>
        <View style={styles.content}>
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          {message ? (
            <Text selectable style={[styles.message, { color: colors.textSecondary }]}>
              {message}
            </Text>
          ) : null}
          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={confirmLabel}
              disabled={isLoading}
              onPress={onConfirm}
              style={({ pressed }) => [
                styles.confirmAction,
                {
                  backgroundColor: tone === "danger" ? colors.danger : colors.primary,
                  opacity: isLoading ? 0.5 : pressed ? 0.76 : 1,
                },
              ]}
            >
              {isLoading ? (
                <ActivityIndicator
                  color={tone === "danger" && dark ? "#2A0B12" : colors.onPrimary}
                />
              ) : (
                <Text
                  style={[
                    styles.confirmLabel,
                    { color: tone === "danger" && dark ? "#2A0B12" : colors.onPrimary },
                  ]}
                >
                  {confirmLabel}
                </Text>
              )}
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={cancelLabel}
              onPress={() => onOpenChange(false)}
              style={({ pressed }) => [
                styles.cancelAction,
                {
                  backgroundColor: colors.surfaceMuted,
                  borderColor: colors.divider,
                  opacity: pressed ? 0.72 : 1,
                },
              ]}
            >
              <Text style={[styles.cancelLabel, { color: colors.text }]}>{cancelLabel}</Text>
            </Pressable>
          </View>
        </View>
      </RNHostView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  content: { width: "100%", paddingHorizontal: 28, paddingTop: 12, paddingBottom: 24, gap: 18 },
  title: { fontSize: 24, lineHeight: 30, fontWeight: "800", letterSpacing: -0.4 },
  message: { fontSize: 16, lineHeight: 23 },
  actions: { gap: 4, marginTop: 8 },
  confirmAction: {
    minHeight: 54,
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmLabel: { fontSize: 16, fontWeight: "700" },
  cancelAction: {
    minHeight: 44,
    borderRadius: 22,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelLabel: { fontSize: 15, fontWeight: "600" },
});
