import { useEffect, useState } from "react";
import { AccessibilityInfo, Platform } from "react-native";

export function useReduceTransparency(): boolean {
  const [enabled, setEnabled] = useState(Platform.OS === "ios");

  useEffect(() => {
    if (Platform.OS !== "ios") return;

    void AccessibilityInfo.isReduceTransparencyEnabled().then(setEnabled);
    const subscription = AccessibilityInfo.addEventListener(
      "reduceTransparencyChanged",
      setEnabled,
    );

    return () => subscription.remove();
  }, []);

  return enabled;
}
