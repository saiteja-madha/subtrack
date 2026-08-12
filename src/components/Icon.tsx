import Ionicons from "@expo/vector-icons/Ionicons";
import type { IconName, IconProps } from "@/components/Icon.types";

export type { IconName, IconProps } from "@/components/Icon.types";

export function Icon({ name, size = 20, color }: IconProps) {
  return <Ionicons name={name} size={size} color={color} />;
}

export function iconColorForCategory(categoryId: string | null | undefined): string {
  if (!categoryId) return "#94a3b8";
  let hash = 0;
  for (let i = 0; i < categoryId.length; i += 1) {
    hash = (hash * 31 + categoryId.charCodeAt(i)) % 997;
  }
  const palette = [
    "#6366f1",
    "#8b5cf6",
    "#ec4899",
    "#f43f5e",
    "#f59e0b",
    "#10b981",
    "#06b6d4",
    "#3b82f6",
    "#14b8a6",
    "#84cc16",
  ];
  return palette[hash % palette.length];
}
