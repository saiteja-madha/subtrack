import { Image } from "expo-image";

import type { IconName, IconProps } from "@/components/Icon.types";

export type { IconName, IconProps } from "@/components/Icon.types";

const SF_SYMBOLS: Partial<Record<IconName, string>> = {
  add: "plus",
  "alert-circle-outline": "exclamationmark.circle",
  "barbell-outline": "dumbbell",
  "briefcase-outline": "briefcase",
  "calendar-outline": "calendar",
  "checkmark-circle": "checkmark.circle.fill",
  "card-outline": "creditcard",
  "chevron-back": "chevron.left",
  "chevron-down": "chevron.down",
  "chevron-forward": "chevron.right",
  "close-circle": "xmark.circle.fill",
  "cloud-outline": "cloud",
  "download-outline": "square.and.arrow.down",
  "film-outline": "film",
  "flash-outline": "bolt",
  "folder-outline": "folder",
  "game-controller-outline": "gamecontroller",
  "heart-outline": "heart",
  "home-outline": "house",
  home: "house.fill",
  list: "list.bullet.rectangle.fill",
  "list-outline": "list.bullet.rectangle",
  "musical-notes-outline": "music.note",
  "options-outline": "slider.horizontal.3",
  pencil: "pencil",
  "pricetag-outline": "tag",
  school: "graduationcap",
  "school-outline": "graduationcap",
  search: "magnifyingglass",
  "search-outline": "magnifyingglass",
  settings: "gearshape.fill",
  "settings-outline": "gearshape",
  "share-outline": "square.and.arrow.up",
  "sparkles-outline": "sparkles",
  "trash-outline": "trash",
  "wallet-outline": "wallet.pass",
};

export function Icon({ name, size = 20, color }: IconProps) {
  const symbol = SF_SYMBOLS[name];
  if (!symbol && __DEV__) {
    console.warn(`Missing SF Symbol mapping for icon: ${name}`);
  }
  return (
    <Image
      source={`sf:${symbol ?? "questionmark.circle"}`}
      tintColor={typeof color === "string" ? color : undefined}
      style={{ width: size, height: size }}
      contentFit="contain"
      accessibilityLabel=""
    />
  );
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
