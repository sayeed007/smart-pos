/**
 * Theme Configuration
 * This file defines the structure for theming system
 * All colors, fonts, sizes should be configurable
 */

export interface ThemeColors {
  // Primary colors
  primary: string;
  primaryForeground: string;
  primaryHover: string;

  // Secondary colors
  secondary: string;
  secondaryForeground: string;
  secondaryHover: string;

  // Background colors
  background: string;
  foreground: string;

  // UI colors
  card: string;
  cardForeground: string;
  popover: string;
  popoverForeground: string;

  // Muted colors
  muted: string;
  mutedForeground: string;

  // Accent colors
  accent: string;
  accentForeground: string;

  // Destructive/Error colors
  destructive: string;
  destructiveForeground: string;

  // Border & Input
  border: string;
  input: string;
  ring: string;

  // Semantic colors
  success?: string;
  warning?: string;
  info?: string;

  // Sidebar colors
  sidebar?: string;
  sidebarForeground?: string;
  sidebarPrimary?: string;
  sidebarPrimaryForeground?: string;
  sidebarAccent?: string;
  sidebarAccentForeground?: string;
  sidebarBorder?: string;
  sidebarRing?: string;

  // Chart colors
  chart1?: string;
  chart2?: string;
  chart3?: string;
  chart4?: string;
  chart5?: string;

  // Toast semantic tokens (bg / text / border)
  successBg?: string;
  successText?: string;
  successBorder?: string;
  errorBg?: string;
  errorText?: string;
  errorBorder?: string;
  warningBg?: string;
  warningText?: string;
  warningBorder?: string;
  infoBg?: string;
  infoText?: string;
  infoBorder?: string;
}

export interface ThemeTypography {
  // Font families
  fontFamily: {
    sans: string;
    serif?: string;
    mono?: string;
  };

  // Font sizes
  fontSize: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    "2xl": string;
    "3xl": string;
    "4xl": string;
  };

  // Font weights
  fontWeight: {
    normal: number;
    medium: number;
    semibold: number;
    bold: number;
    black: number;
  };

  // Line heights
  lineHeight: {
    tight: string;
    normal: string;
    relaxed: string;
  };
}

export interface ThemeSpacing {
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    "2xl": string;
    full: string;
  };

  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    "2xl": string;
  };
}

export interface ThemeConfig {
  name: string;
  light: ThemeColors;
  dark: ThemeColors;
  typography: ThemeTypography;
  spacing: ThemeSpacing;
}

/**
 * Default Light Theme Colors
 */
export const defaultLightColors: ThemeColors = {
  primary: "#f87171", // Red-400
  primaryForeground: "#ffffff",
  primaryHover: "#ef4444", // Red-500

  secondary: "#f1f5f9", // Slate-100
  secondaryForeground: "#0f172a", // Slate-900
  secondaryHover: "#e2e8f0", // Slate-200

  background: "#ffffff",
  foreground: "#0f172a", // Slate-900

  card: "#ffffff",
  cardForeground: "#0f172a",
  popover: "#ffffff",
  popoverForeground: "#0f172a",

  muted: "#f1f5f9", // Slate-100
  mutedForeground: "#64748b", // Slate-500

  accent: "#f1f5f9",
  accentForeground: "#0f172a",

  destructive: "#ef4444", // Red-500
  destructiveForeground: "#ffffff",

  border: "#0000001A",
  input: "#e2e8f0",
  ring: "#f87171",

  success: "#10b981", // Green-500
  warning: "#f59e0b", // Amber-500
  info: "#3b82f6", // Blue-500

  // Sidebar
  sidebar: "#ffffff",
  sidebarForeground: "#0f172a",
  sidebarPrimary: "#f87171",
  sidebarPrimaryForeground: "#ffffff",
  sidebarAccent: "#f1f5f9",
  sidebarAccentForeground: "#0f172a",
  sidebarBorder: "#0000001A",
  sidebarRing: "#f87171",

  // Charts
  chart1: "#f87171",
  chart2: "#60a5fa",
  chart3: "#34d399",
  chart4: "#fbbf24",
  chart5: "#a78bfa",

  // Toast tokens
  successBg: "#f0fdf4",
  successText: "#166534",
  successBorder: "#86efac",
  errorBg: "#fef2f2",
  errorText: "#991b1b",
  errorBorder: "#fca5a5",
  warningBg: "#fffbeb",
  warningText: "#92400e",
  warningBorder: "#fcd34d",
  infoBg: "#eff6ff",
  infoText: "#1e40af",
  infoBorder: "#93c5fd",
};

/**
 * Default Dark Theme Colors
 */
export const defaultDarkColors: ThemeColors = {
  primary: "#f87171",
  primaryForeground: "#ffffff",
  primaryHover: "#ef4444",

  secondary: "#1e293b", // Slate-800
  secondaryForeground: "#f1f5f9",
  secondaryHover: "#334155", // Slate-700

  background: "#020817", // Slate-950
  foreground: "#f1f5f9",

  card: "#0f172a", // Slate-900
  cardForeground: "#f1f5f9",
  popover: "#0f172a",
  popoverForeground: "#f1f5f9",

  muted: "#1e293b",
  mutedForeground: "#94a3b8", // Slate-400

  accent: "#1e293b",
  accentForeground: "#f1f5f9",

  destructive: "#7f1d1d", // Red-900
  destructiveForeground: "#f1f5f9",

  border: "#1e293b",
  input: "#1e293b",
  ring: "#f87171",

  success: "#10b981",
  warning: "#f59e0b",
  info: "#3b82f6",

  // Sidebar
  sidebar: "#0f172a",
  sidebarForeground: "#f1f5f9",
  sidebarPrimary: "#f87171",
  sidebarPrimaryForeground: "#ffffff",
  sidebarAccent: "#1e293b",
  sidebarAccentForeground: "#f1f5f9",
  sidebarBorder: "#1e293b",
  sidebarRing: "#f87171",

  // Charts
  chart1: "#f87171",
  chart2: "#60a5fa",
  chart3: "#34d399",
  chart4: "#fbbf24",
  chart5: "#a78bfa",

  // Toast tokens (dark-adjusted)
  successBg: "#052e16",
  successText: "#86efac",
  successBorder: "#166534",
  errorBg: "#450a0a",
  errorText: "#fca5a5",
  errorBorder: "#991b1b",
  warningBg: "#431407",
  warningText: "#fcd34d",
  warningBorder: "#92400e",
  infoBg: "#0c1445",
  infoText: "#93c5fd",
  infoBorder: "#1e40af",
};

/**
 * Default Typography Settings
 */
export const defaultTypography: ThemeTypography = {
  fontFamily: {
    sans: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    mono: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
  },

  fontSize: {
    xs: "0.75rem", // 12px
    sm: "0.875rem", // 14px
    base: "1rem", // 16px
    lg: "1.125rem", // 18px
    xl: "1.25rem", // 20px
    "2xl": "1.5rem", // 24px
    "3xl": "1.875rem", // 30px
    "4xl": "2.25rem", // 36px
  },

  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    black: 900,
  },

  lineHeight: {
    tight: "1.25",
    normal: "1.5",
    relaxed: "1.75",
  },
};

/**
 * Default Spacing Settings
 */
export const defaultSpacing: ThemeSpacing = {
  borderRadius: {
    sm: "0.375rem", // 6px
    md: "0.5rem", // 8px
    lg: "0.75rem", // 12px
    xl: "1rem", // 16px
    "2xl": "1.5rem", // 24px
    full: "9999px",
  },

  spacing: {
    xs: "0.25rem", // 4px
    sm: "0.5rem", // 8px
    md: "1rem", // 16px
    lg: "1.5rem", // 24px
    xl: "2rem", // 32px
    "2xl": "3rem", // 48px
  },
};

/**
 * Default Theme Configuration
 */
export const defaultTheme: ThemeConfig = {
  name: "default",
  light: defaultLightColors,
  dark: defaultDarkColors,
  typography: defaultTypography,
  spacing: defaultSpacing,
};

/**
 * Available preset themes
 */
export const themePresets: Record<string, ThemeConfig> = {
  default: defaultTheme,

  // Blue theme
  blue: {
    ...defaultTheme,
    name: "blue",
    light: {
      ...defaultLightColors,
      primary: "#3b82f6",
      primaryHover: "#2563eb",
      ring: "#3b82f6",
    },
    dark: {
      ...defaultDarkColors,
      primary: "#3b82f6",
      primaryHover: "#2563eb",
      ring: "#3b82f6",
    },
  },

  // Green theme
  green: {
    ...defaultTheme,
    name: "green",
    light: {
      ...defaultLightColors,
      primary: "#10b981",
      primaryHover: "#059669",
      ring: "#10b981",
    },
    dark: {
      ...defaultDarkColors,
      primary: "#10b981",
      primaryHover: "#059669",
      ring: "#10b981",
    },
  },

  // Purple theme
  purple: {
    ...defaultTheme,
    name: "purple",
    light: {
      ...defaultLightColors,
      primary: "#8b5cf6",
      primaryHover: "#7c3aed",
      ring: "#8b5cf6",
    },
    dark: {
      ...defaultDarkColors,
      primary: "#8b5cf6",
      primaryHover: "#7c3aed",
      ring: "#8b5cf6",
    },
  },
};
