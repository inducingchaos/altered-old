/**
 *
 */

import type { ThemeConfig } from "tailwindcss/types/config"

export const transitionTimingFunction = {
    linear: "linear",

    in: "var(--ease-in)",
    out: "var(--ease-out)",
    "in-out": "var(--ease-in-out)"
} satisfies ThemeConfig["transitionTimingFunction"]
