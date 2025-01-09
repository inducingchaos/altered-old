/**
 *
 */

import type { ThemeConfig } from "tailwindcss/types/config"

export const opacity = {
    zero: "0%",
    "thirty-second": "3.125%",
    sixteenth: "6.25%",
    "3-32": "9.375%",
    eighth: "12.5%",
    "3-16": "18.75%",
    quarter: "25%",
    "3-8": "37.5%",
    half: "50%",
    "-quarter": "75%",
    "-eighth": "87.5%",
    "-sixteenth": "93.75%",
    "-thirty-second": "96.875%",
    full: "100%"
} satisfies ThemeConfig["opacity"]
