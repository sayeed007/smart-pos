"use client";

/**
 * Theme Selector Component
 * Allows users to switch between different theme presets
 */

import React from "react";
import { useCustomTheme } from "@/providers/custom-theme-provider";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Palette, Sun, Moon, Monitor } from "lucide-react";

import { cn } from "@/lib/utils";

export function ThemeSelector({ className }: { className?: string }) {
  const { themeConfig, setThemeName, availableThemes } = useCustomTheme();
  const { theme, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "relative text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors",
            className,
          )}
        >
          <Palette className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="right" align="end" className="w-48 ml-2">
        <DropdownMenuLabel>Theme Settings</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Light/Dark Mode */}
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          Mode
        </DropdownMenuLabel>
        <DropdownMenuItem onClick={() => setTheme("light")}>
          <Sun className="mr-2 h-4 w-4" />
          Light
          {theme === "light" && <span className="ml-auto">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          <Moon className="mr-2 h-4 w-4" />
          Dark
          {theme === "dark" && <span className="ml-auto">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          <Monitor className="mr-2 h-4 w-4" />
          System
          {theme === "system" && <span className="ml-auto">✓</span>}
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Color Themes */}
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          Color Theme
        </DropdownMenuLabel>
        {availableThemes.map((themeName) => (
          <DropdownMenuItem
            key={themeName}
            onClick={() => setThemeName(themeName)}
          >
            <div
              className="mr-2 h-4 w-4 rounded-full border"
              style={{
                backgroundColor:
                  themeName === themeConfig.name
                    ? `hsl(${themeConfig.light.primary})` // Use CSS variable or direct value if needed
                    : undefined,
              }}
              // Fallback to style using the actual color if the variable isn't resolving in this context
              // Ideally we use a class like 'bg-primary' but we need specific colors for the list
            />
            <span className="capitalize">{themeName}</span>
            {themeName === themeConfig.name && (
              <span className="ml-auto">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
