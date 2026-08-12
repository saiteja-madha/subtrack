import React, { createContext, useContext, useMemo } from "react";
import { Platform, useColorScheme, type ColorValue } from "react-native";

import type { AppearanceMode } from "@/domain/types";

export interface AppColors {
  background: string;
  backgroundAlt: string;
  surface: string;
  surfaceStrong: string;
  surfaceMuted: string;
  glass: string;
  glassBorder: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  primary: string;
  primaryPressed: string;
  primarySoft: string;
  onPrimary: string;
  divider: string;
  danger: string;
  dangerSoft: string;
  success: string;
  successSoft: string;
  warning: string;
  warningSoft: string;
  shadow: ColorValue;
}

export interface AppTheme {
  dark: boolean;
  colors: AppColors;
}

const light: AppColors = {
  background: "#F3F6FC",
  backgroundAlt: "#E8EEFA",
  surface: "#FFFFFF",
  surfaceStrong: "#FFFFFF",
  surfaceMuted: "#EEF2F8",
  glass: "rgba(255,255,255,0.68)",
  glassBorder: "rgba(255,255,255,0.88)",
  text: "#131A2A",
  textSecondary: "#4E596E",
  textMuted: "#667085",
  primary: "#5B5CE2",
  primaryPressed: "#4849C6",
  primarySoft: "#E9E9FF",
  onPrimary: "#FFFFFF",
  divider: "rgba(91,104,130,0.14)",
  danger: "#D9415D",
  dangerSoft: "#FFE8ED",
  success: "#168761",
  successSoft: "#DCF7EC",
  warning: "#B16B00",
  warningSoft: "#FFF1D6",
  shadow: "#17213B",
};

const dark: AppColors = {
  background: "#090D18",
  backgroundAlt: "#11182A",
  surface: "#171E2F",
  surfaceStrong: "#1D263A",
  surfaceMuted: "#202A3F",
  glass: "rgba(25,34,52,0.70)",
  glassBorder: "rgba(255,255,255,0.12)",
  text: "#F7F8FC",
  textSecondary: "#C3CAD8",
  textMuted: "#8F9AAF",
  primary: "#8B8CFF",
  primaryPressed: "#7778E8",
  primarySoft: "rgba(139,140,255,0.18)",
  onPrimary: "#0E1027",
  divider: "rgba(220,228,245,0.12)",
  danger: "#FF7890",
  dangerSoft: "rgba(255,90,120,0.16)",
  success: "#55D3A6",
  successSoft: "rgba(63,211,160,0.15)",
  warning: "#FFC568",
  warningSoft: "rgba(255,187,73,0.15)",
  shadow: "#000000",
};

const ThemeContext = createContext<AppTheme>({ dark: false, colors: light });

export function AppThemeProvider({
  appearance,
  children,
}: {
  appearance: AppearanceMode;
  children: React.ReactNode;
}) {
  const system = useColorScheme();
  const isDark = appearance === "dark" || (appearance === "system" && system === "dark");
  const value = useMemo(() => ({ dark: isDark, colors: isDark ? dark : light }), [isDark]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme(): AppTheme {
  return useContext(ThemeContext);
}

export const radii = { sm: 10, md: 14, lg: 20, xl: 28, pill: 999 } as const;
export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 28 } as const;

export const elevation = Platform.select({
  web: { boxShadow: "0 16px 42px rgba(23, 33, 59, 0.10)" },
  default: {
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 22,
    elevation: 5,
  },
});
