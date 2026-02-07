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
  const root = document.documentElement;

  // Helper function to convert hex to HSL
  const hexToHSL = (hex: string): string => {
    // Remove # if present
    hex = hex.replace(/^#/, "");

    // Parse hex values
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0,
      s = 0,
      l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r:
          h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
          break;
        case g:
          h = ((b - r) / d + 2) / 6;
          break;
        case b:
          h = ((r - g) / d + 4) / 6;
          break;
      }
    }

    h = Math.round(h * 360);
    s = Math.round(s * 100);
    l = Math.round(l * 100);

    return `${h} ${s}% ${l}%`;
  };

  // Apply light theme colors
  root.style.setProperty("--primary", hexToHSL(config.light.primary));
  root.style.setProperty(
    "--primary-foreground",
    hexToHSL(config.light.primaryForeground),
  );
  root.style.setProperty("--secondary", hexToHSL(config.light.secondary));
  root.style.setProperty(
    "--secondary-foreground",
    hexToHSL(config.light.secondaryForeground),
  );
  root.style.setProperty("--muted", hexToHSL(config.light.muted));
  root.style.setProperty(
    "--muted-foreground",
    hexToHSL(config.light.mutedForeground),
  );
  root.style.setProperty("--accent", hexToHSL(config.light.accent));
  root.style.setProperty(
    "--accent-foreground",
    hexToHSL(config.light.accentForeground),
  );
  root.style.setProperty("--destructive", hexToHSL(config.light.destructive));
  root.style.setProperty(
    "--destructive-foreground",
    hexToHSL(config.light.destructiveForeground),
  );
  root.style.setProperty("--border", hexToHSL(config.light.border));
  root.style.setProperty("--input", hexToHSL(config.light.input));
  root.style.setProperty("--ring", hexToHSL(config.light.ring));

  // Apply dark theme colors (with .dark prefix)
  const darkStyleId = "dark-theme-vars";
  let darkStyle = document.getElementById(darkStyleId) as HTMLStyleElement;

  if (!darkStyle) {
    darkStyle = document.createElement("style");
    darkStyle.id = darkStyleId;
    document.head.appendChild(darkStyle);
  }

  darkStyle.textContent = `.dark {
    --primary: ${hexToHSL(config.dark.primary)};
    --primary-foreground: ${hexToHSL(config.dark.primaryForeground)};
    --secondary: ${hexToHSL(config.dark.secondary)};
    --secondary-foreground: ${hexToHSL(config.dark.secondaryForeground)};
    --muted: ${hexToHSL(config.dark.muted)};
    --muted-foreground: ${hexToHSL(config.dark.mutedForeground)};
    --accent: ${hexToHSL(config.dark.accent)};
    --accent-foreground: ${hexToHSL(config.dark.accentForeground)};
    --destructive: ${hexToHSL(config.dark.destructive)};
    --destructive-foreground: ${hexToHSL(config.dark.destructiveForeground)};
    --border: ${hexToHSL(config.dark.border)};
    --input: ${hexToHSL(config.dark.input)};
    --ring: ${hexToHSL(config.dark.ring)};
  }`;

  // Apply typography
  Object.entries(config.typography.fontFamily).forEach(([key, value]) => {
    root.style.setProperty(`--font-${key}`, value);
  });

  Object.entries(config.typography.fontSize).forEach(([key, value]) => {
    root.style.setProperty(`--text-${key}`, value);
  });

  Object.entries(config.typography.fontWeight).forEach(([key, value]) => {
    root.style.setProperty(`--font-weight-${key}`, String(value));
  });

  Object.entries(config.typography.lineHeight).forEach(([key, value]) => {
    root.style.setProperty(`--line-height-${key}`, value);
  });

  // Apply spacing
  Object.entries(config.spacing.borderRadius).forEach(([key, value]) => {
    root.style.setProperty(`--radius-${key}`, value);
  });

  Object.entries(config.spacing.spacing).forEach(([key, value]) => {
    root.style.setProperty(`--spacing-${key}`, value);
  });
}
