/**
 *
 */

import defaultTheme from "tailwindcss/defaultTheme"
import type { ThemeConfig } from "tailwindcss/types/config"

export const borderRadius = {
    "0.25x": "calc(var(--border-radius, initial) * 0.25)",
    "0.5x": "calc(var(--border-radius, initial) * 0.5)",
    "0.75x": "calc(var(--border-radius, initial) * 0.75)",
    DEFAULT: "var(--border-radius)",
    "1.5x": "calc(var(--border-radius, initial) * 1.5)",
    "2x": "calc(var(--border-radius, initial) * 2)",
    "3x": "calc(var(--border-radius, initial) * 3)",
    "4x": "calc(var(--border-radius, initial) * 4)",
    "6x": "calc(var(--border-radius, initial) * 6)",
    "8x": "calc(var(--border-radius, initial) * 8)",
    "12x": "calc(var(--border-radius, initial) * 12)",
    "16x": "calc(var(--border-radius, initial) * 16)",
    "24x": "calc(var(--border-radius, initial) * 24)",
    "32x": "calc(var(--border-radius, initial) * 32)",
    "48x": "calc(var(--border-radius, initial) * 48)",
    "64x": "calc(var(--border-radius, initial) * 64)",

    "0px": defaultTheme.borderRadius.none,
    "1px": "1px",
    "2px": "2px",
    "3px": "3px",
    "4px": "4px",
    "6px": "6px",
    "8px": "8px",
    "12px": "12px",
    "16px": "16px",
    "24px": "24px",
    "32px": "32px",
    "48px": "48px",
    "64px": "64px",
    "96px": "96px",
    "128px": "128px",
    "192px": "192px",
    "256px": "256px",
    full: defaultTheme.borderRadius.full
} satisfies ThemeConfig["borderRadius"]
