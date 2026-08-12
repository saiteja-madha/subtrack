import { Icon } from "@/components/Icon";
import { GlassIconButton } from "@/components/ui";
import { useAppTheme } from "@/theme";

export function AddSubscriptionButton({
  onPress,
  disabled,
}: {
  onPress: () => void;
  disabled?: boolean;
}) {
  const { colors } = useAppTheme();

  return (
    <GlassIconButton
      icon={<Icon name="add" size={29} color={colors.text} />}
      accessibilityLabel="Add subscription"
      onPress={onPress}
      disabled={disabled}
    />
  );
}
