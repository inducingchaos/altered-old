/**
 *
 */

import type { ThemeConfig } from "tailwindcss/types/config"

export const colors = {
    main: "hsl(var(--color-main))",
    "main-constant": "hsl(var(--color-main-constant))",
    neutral: "hsl(var(--color-neutral))",
    alternate: "hsl(var(--color-alternate))",
    "alternate-constant": "hsl(var(--color-alternate-constant))",

    warning: "hsl(var(--color-warning))",
    danger: "hsl(var(--color-danger))",
    success: "hsl(var(--color-success))",
    info: "hsl(var(--color-info))",

    accent: "hsl(var(--color-accent))",
    "accent-constant": "hsl(var(--color-accent-constant))",
    "accent-neutral": "hsl(var(--color-accent-neutral))",
    "accent-alternate": "hsl(var(--color-accent-alternate))",
    "accent-alternate-constant": "hsl(var(--color-accent-alternate-constant))"
} satisfies ThemeConfig["colors"]
