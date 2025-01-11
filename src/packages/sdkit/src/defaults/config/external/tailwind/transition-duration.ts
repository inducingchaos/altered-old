/**
 *
 */

import type { ThemeConfig } from "tailwindcss/types/config"

export const transitionDuration = {
    zero: "0ms",
    "thirty-second": "31.25ms",
    sixteenth: "62.5ms",
    eighth: "125ms",
    quarter: "250ms",
    half: "500ms",
    "-quarter": "750ms",

    "1s": "1s",
    "2s": "2s",
    "3s": "3s",
    "4s": "4s",
    "6s": "6s",
    "8s": "8s",
    "12s": "12s",
    "16s": "16s",

    "5s": "5s",
    "10s": "10s"
} satisfies ThemeConfig["transitionDuration"]
