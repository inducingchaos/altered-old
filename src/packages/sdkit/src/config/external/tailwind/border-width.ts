/**
 *
 */

import type { ThemeConfig } from "tailwindcss/types/config"

export const borderWidth = {
    "0.25x": "calc(var(--border-width) * 0.25)",
    "0.5x": "calc(var(--border-width) * 0.5)",
    "0.75x": "calc(var(--border-width) * 0.75)",
    DEFAULT: "var(--border-width)",
    "2x": "calc(var(--border-width) * 2)",
    "3x": "calc(var(--border-width) * 3)",
    "4x": "calc(var(--border-width) * 4)",
    "6x": "calc(var(--border-width) * 6)",
    "8x": "calc(var(--border-width) * 8)",
    "12x": "calc(var(--border-width) * 12)",
    "16x": "calc(var(--border-width) * 16)",

    "0px": "0px",
    "0.25px": "0.25px",
    "0.5px": "0.5px",
    "0.75px": "0.75px",
    "1px": "1px",
    "2px": "2px",
    "3px": "3px",
    "4px": "4px",
    "6px": "6px",
    "8px": "8px",
    "12px": "12px",
    "16px": "16px"
} satisfies ThemeConfig["borderWidth"]
