import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAppTheme } from "@/theme";

interface ScreenProps {
  children: React.ReactNode;
  scroll?: boolean;
  contentContainerStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
  refreshing?: boolean;
  onRefresh?: () => void;
  keyboardShouldPersistTaps?: "always" | "never" | "handled";
  header?: React.ReactNode;
}

export function Screen({
  children,
  scroll = true,
  contentContainerStyle,
  style,
  refreshing,
  onRefresh,
  keyboardShouldPersistTaps = "handled",
  header,
}: ScreenProps) {
  const { colors } = useAppTheme();
  const background = { backgroundColor: colors.background };
  return (
    <SafeAreaView edges={["top"]} style={[styles.safe, background, style]}>
      <View
        style={[
          styles.orb,
          styles.orbTop,
          { backgroundColor: colors.primarySoft, pointerEvents: "none" },
        ]}
      />
      <View
        style={[
          styles.orb,
          styles.orbBottom,
          { backgroundColor: colors.backgroundAlt, pointerEvents: "none" },
        ]}
      />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {header}
        {scroll ? (
          <ScrollView
            style={styles.flex}
            contentContainerStyle={[styles.grow, contentContainerStyle]}
            keyboardShouldPersistTaps={keyboardShouldPersistTaps}
            keyboardDismissMode="on-drag"
            refreshControl={
              onRefresh ? (
                <RefreshControl
                  refreshing={!!refreshing}
                  onRefresh={onRefresh}
                  tintColor={colors.primary}
                />
              ) : undefined
            }
          >
            {children}
          </ScrollView>
        ) : (
          <View style={[styles.flex, contentContainerStyle]}>{children}</View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, overflow: "hidden" },
  flex: { flex: 1 },
  grow: { flexGrow: 1 },
  orb: { position: "absolute", width: 260, height: 260, borderRadius: 130, opacity: 0.7 },
  orbTop: { top: -130, right: -90 },
  orbBottom: { bottom: -150, left: -120 },
});
