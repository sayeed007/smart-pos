"use client";

/**
 * Custom Theme Provider
 * Extends next-themes with custom theme configuration
 */

import React, { createContext, useContext, useEffect, useState } from "react";
import { ThemeProvider as NextThemeProvider } from "next-themes";
import { ThemeConfig, themePresets } from "@/config/theme.config";

interface CustomThemeContextType {
  themeConfig: ThemeConfig;
  setThemeName: (name: string) => void;
  availableThemes: string[];
}

const CustomThemeContext = createContext<CustomThemeContextType | undefined>(
  undefined,
);

export function CustomThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Load saved theme name on mount (lazy initialization)
  const [currentThemeName, setCurrentThemeName] = useState(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme-name");
      if (savedTheme && themePresets[savedTheme]) {
        return savedTheme;
      }
    }
    return "default";
  });

  // Compute theme config from theme name
  const themeConfig = React.useMemo(
    () => themePresets[currentThemeName] || themePresets.default,
    [currentThemeName],
  );

  // Apply CSS variables when theme config changes
  useEffect(() => {
    applyThemeVariables(themeConfig);
  }, [themeConfig]);

  const setThemeName = (name: string) => {
    if (themePresets[name]) {
      setCurrentThemeName(name);
      localStorage.setItem("theme-name", name);
    }
  };

  return (
    <NextThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <CustomThemeContext.Provider
        value={{
          themeConfig,
          setThemeName,
          availableThemes: Object.keys(themePresets),
        }}
      >
        {children}
      </CustomThemeContext.Provider>
    </NextThemeProvider>
  );
}

/**
 * Hook to use custom theme
 */
export function useCustomTheme() {
  const context = useContext(CustomThemeContext);
  if (context === undefined) {
    throw new Error("useCustomTheme must be used within CustomThemeProvider");
  }
  return context;
}

/**
 * Apply theme variables to document root
 */
function applyThemeVariables(config: ThemeConfig) {
  const styleId = "aura-theme-vars";
  let styleEl = document.getElementById(styleId) as HTMLStyleElement;

  if (!styleEl) {
    styleEl = document.createElement("style");
    styleEl.id = styleId;
    document.head.appendChild(styleEl);
  }

  const lc = config.light;
  const dc = config.dark;
  const typo = config.typography;
  const space = config.spacing;

  // Generate Typography & Spacing CSS strings dynamically
  let typoCss = "";
  Object.entries(typo.fontFamily).forEach(
    ([k, v]) => (typoCss += `--font-${k}: ${v};\n  `),
  );
  Object.entries(typo.fontSize).forEach(
    ([k, v]) => (typoCss += `--text-${k}: ${v};\n  `),
  );
  Object.entries(typo.fontWeight).forEach(
    ([k, v]) => (typoCss += `--font-weight-${k}: ${v};\n  `),
  );
  Object.entries(typo.lineHeight).forEach(
    ([k, v]) => (typoCss += `--line-height-${k}: ${v};\n  `),
  );

  let spaceCss = "";
  Object.entries(space.borderRadius).forEach(
    ([k, v]) => (spaceCss += `--radius-${k}: ${v};\n  `),
  );
  Object.entries(space.spacing).forEach(
    ([k, v]) => (spaceCss += `--spacing-${k}: ${v};\n  `),
  );

  styleEl.textContent = `
    :root {
      /* Typography */
      ${typoCss}
      
      /* Spacing */
      ${spaceCss}

      /* Light Theme Colors */
      --background: ${lc.background};
      --foreground: ${lc.foreground};
      --card: ${lc.card};
      --card-foreground: ${lc.cardForeground};
      --popover: ${lc.popover};
      --popover-foreground: ${lc.popoverForeground};
      --primary: ${lc.primary};
      --primary-foreground: ${lc.primaryForeground};
      --secondary: ${lc.secondary};
      --secondary-foreground: ${lc.secondaryForeground};
      --muted: ${lc.muted};
      --muted-foreground: ${lc.mutedForeground};
      --accent: ${lc.accent};
      --accent-foreground: ${lc.accentForeground};
      --destructive: ${lc.destructive};
      --destructive-foreground: ${lc.destructiveForeground};
      --border: ${lc.border};
      --input: ${lc.input};
      --ring: ${lc.ring};
    }

    .dark {
      /* Dark Theme Colors */
      --background: ${dc.background};
      --foreground: ${dc.foreground};
      --card: ${dc.card};
      --card-foreground: ${dc.cardForeground};
      --popover: ${dc.popover};
      --popover-foreground: ${dc.popoverForeground};
      --primary: ${dc.primary};
      --primary-foreground: ${dc.primaryForeground};
      --secondary: ${dc.secondary};
      --secondary-foreground: ${dc.secondaryForeground};
      --muted: ${dc.muted};
      --muted-foreground: ${dc.mutedForeground};
      --accent: ${dc.accent};
      --accent-foreground: ${dc.accentForeground};
      --destructive: ${dc.destructive};
      --destructive-foreground: ${dc.destructiveForeground};
      --border: ${dc.border};
      --input: ${dc.input};
      --ring: ${dc.ring};
    }
  `;
}
