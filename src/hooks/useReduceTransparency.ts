import { useEffect, useState } from "react";
import { AccessibilityInfo } from "react-native";

export function useReduceTransparency(): boolean {
  const [enabled, setEnabled] = useState(process.env.EXPO_OS === "ios");

  useEffect(() => {
    if (process.env.EXPO_OS !== "ios") return;

    void AccessibilityInfo.isReduceTransparencyEnabled().then(setEnabled);
    const subscription = AccessibilityInfo.addEventListener(
      "reduceTransparencyChanged",
      setEnabled,
    );

    return () => subscription.remove();
  }, []);

  return enabled;
}
