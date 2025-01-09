/**
 *
 */

import defaultTheme from "tailwindcss/defaultTheme"
import type { ThemeConfig } from "tailwindcss/types/config"

export const fontSize = {
    "0px": "0rem",
    "1px": "0.0625rem",
    "2px": "0.125rem",
    "3px": "0.1875rem",
    "4px": "0.25rem",
    "6px": "0.375rem",
    "8px": "0.5rem",
    "10px": "0.625rem",
    "12px": defaultTheme.fontSize.xs,
    "14px": defaultTheme.fontSize.sm,
    "16px": defaultTheme.fontSize.base,
    "20px": defaultTheme.fontSize.xl,
    "24px": defaultTheme.fontSize["2xl"],
    "28px": "1.75rem",
    "32px": "2rem",
    "40px": "2.5rem",
    "48px": defaultTheme.fontSize["5xl"],
    "56px": "3.5rem",
    "64px": "4rem",
    "80px": "5rem",
    "96px": defaultTheme.fontSize["8xl"],
    "112px": "7rem",
    "128px": defaultTheme.fontSize["9xl"],
    "160px": "10rem",
    "192px": "12rem",
    "224px": "14rem",
    "256px": "16rem",
    "320px": "20rem",
    "384px": "24rem",
    "448px": "28rem",
    "512px": "32rem",
    "640px": "40rem",
    "768px": "48rem",
    "896px": "56rem",
    "1024px": "64rem"
} satisfies ThemeConfig["fontSize"]
