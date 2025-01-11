/**
 *
 */

import defaultTheme from "tailwindcss/defaultTheme"
import type { ThemeConfig } from "tailwindcss/types/config"

export const fontFamily = {
    sans: ["var(--font-px-grotesk)", ...defaultTheme.fontFamily.sans],
    mono: ["var(--font-px-grotesk-mono)", ...defaultTheme.fontFamily.mono],
    serif: ["var(--font-hoefler-text)", ...defaultTheme.fontFamily.serif],

    inter: ["var(--font-inter)", ...defaultTheme.fontFamily.sans],
    geist: ["var(--font-geist)", ...defaultTheme.fontFamily.sans],
    "geist-mono": ["var(--font-geist-mono)", ...defaultTheme.fontFamily.mono],
    saans: ["var(--font-saans)", ...defaultTheme.fontFamily.sans]
} satisfies ThemeConfig["fontFamily"]
