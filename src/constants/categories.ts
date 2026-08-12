export interface CategoryDefinition {
  id: string;
  name: string;
  icon: string;
}

export const DEFAULT_CATEGORIES: CategoryDefinition[] = [
  { id: "cat-entertainment", name: "Entertainment", icon: "film-outline" },
  { id: "cat-productivity", name: "Productivity", icon: "briefcase-outline" },
  { id: "cat-cloud", name: "Cloud & Storage", icon: "cloud-outline" },
  { id: "cat-music", name: "Music", icon: "musical-notes-outline" },
  { id: "cat-gaming", name: "Gaming", icon: "game-controller-outline" },
  { id: "cat-health", name: "Health", icon: "heart-outline" },
  { id: "cat-education", name: "Education", icon: "school-outline" },
  { id: "cat-finance", name: "Finance", icon: "wallet-outline" },
  { id: "cat-utilities", name: "Utilities", icon: "flash-outline" },
  { id: "cat-other", name: "Other", icon: "pricetag-outline" },
];
