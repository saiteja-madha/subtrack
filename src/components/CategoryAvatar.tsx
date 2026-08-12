import React from "react";
import { StyleSheet, View } from "react-native";
import { Icon, iconColorForCategory, type IconName } from "@/components/Icon";
import type { Category } from "@/domain/types";
import { useAppTheme } from "@/theme";

export function CategoryAvatar({
  category,
  size = 40,
  name,
  icon,
}: {
  category?: Category | null;
  size?: number;
  name?: string;
  icon?: IconName;
}) {
  const { colors } = useAppTheme();
  const color = iconColorForCategory(category?.id ?? name ?? null);
  return (
    <View
      style={[
        styles.avatar,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: colors.surfaceMuted,
          borderColor: `${color}30`,
        },
      ]}
    >
      <Icon
        name={icon ?? (category?.icon as IconName) ?? "pricetag-outline"}
        size={size * 0.44}
        color={color}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  avatar: { alignItems: "center", justifyContent: "center", borderWidth: 1 },
});
