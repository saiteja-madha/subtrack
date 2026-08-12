import { Button, Host } from "@expo/ui/swift-ui";
import {
  accessibilityLabel,
  buttonBorderShape,
  buttonStyle,
  controlSize,
  disabled as disabledModifier,
  labelStyle,
  tint,
} from "@expo/ui/swift-ui/modifiers";
import { isGlassEffectAPIAvailable } from "expo-glass-effect";

import { Icon } from "@/components/Icon";
import { GlassIconButton } from "@/components/ui";
import { useReduceTransparency } from "@/hooks/useReduceTransparency";
import { useAppTheme } from "@/theme";

export function AddSubscriptionButton({
  onPress,
  disabled,
}: {
  onPress: () => void;
  disabled?: boolean;
}) {
  const { colors } = useAppTheme();
  const reduceTransparency = useReduceTransparency();
  const useNativeGlass = isGlassEffectAPIAvailable() && !reduceTransparency;

  if (!useNativeGlass) {
    return (
      <GlassIconButton
        icon={<Icon name="add" size={29} color={colors.text} />}
        accessibilityLabel="Add subscription"
        onPress={onPress}
        disabled={disabled}
      />
    );
  }

  return (
    <Host style={{ width: 52, height: 52 }}>
      <Button
        label="Add subscription"
        systemImage="plus"
        onPress={onPress}
        modifiers={[
          buttonStyle("glass"),
          buttonBorderShape("circle"),
          controlSize("extraLarge"),
          labelStyle("iconOnly"),
          tint(colors.text),
          disabledModifier(!!disabled),
          accessibilityLabel("Add subscription"),
        ]}
      />
    </Host>
  );
}
