import React from "react";
import {
  KeyboardAvoidingView,
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
  nativeFormSheet?: boolean;
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
  nativeFormSheet = false,
}: ScreenProps) {
  const { colors, dark } = useAppTheme();
  const useNativeFormSurface = nativeFormSheet && process.env.EXPO_OS === "ios";
  const background = {
    backgroundColor: useNativeFormSurface ? (dark ? "#1C1C1E" : "#F2F2F7") : colors.background,
  };
  return (
    <SafeAreaView collapsable={false} edges={["top"]} style={[styles.safe, background, style]}>
      {!useNativeFormSurface ? (
        <>
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
        </>
      ) : null}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={process.env.EXPO_OS === "ios" ? "padding" : undefined}
      >
        {header}
        {scroll ? (
          <ScrollView
            style={styles.flex}
            contentInsetAdjustmentBehavior="automatic"
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
