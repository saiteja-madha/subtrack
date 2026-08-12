import React from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { AppButton, GlassSurface } from "@/components/ui";
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
  const { colors } = useAppTheme();
  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="fade"
      onRequestClose={() => onOpenChange(false)}
    >
      <Pressable style={styles.backdrop} onPress={() => onOpenChange(false)}>
        <Pressable onPress={() => {}} style={styles.wrap} accessibilityViewIsModal>
          <GlassSurface style={styles.dialog}>
            <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
            {message ? (
              <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text>
            ) : null}
            <View style={styles.actions}>
              <AppButton
                compact
                tone="secondary"
                label={cancelLabel}
                onPress={() => onOpenChange(false)}
              />
              <AppButton
                compact
                tone={tone === "danger" ? "danger" : "primary"}
                label={confirmLabel}
                loading={isLoading}
                onPress={onConfirm}
              />
            </View>
          </GlassSurface>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(2,6,18,.55)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  wrap: { width: "100%", maxWidth: 420 },
  dialog: { padding: 22 },
  title: { fontSize: 20, fontWeight: "800" },
  message: { fontSize: 14, lineHeight: 21, marginTop: 8 },
  actions: { flexDirection: "row", justifyContent: "flex-end", gap: 8, marginTop: 22 },
});
