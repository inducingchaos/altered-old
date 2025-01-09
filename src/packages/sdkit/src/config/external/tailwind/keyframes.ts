/**
 *
 */

import type { ThemeConfig } from "tailwindcss/types/config"

export const keyframes = {
    "navigation-menu-enter": {
        from: { transform: "scale(0.875)", opacity: "0" },
        to: { transform: "scale(1)", opacity: "1" }
    },
    "navigation-menu-exit": {
        from: { transform: "scale(1)", opacity: "1" },
        to: { transform: "scale(0.875)", opacity: "0" }
    },

    "otp-caret-blink": {
        "0%,70%,100%": { opacity: "1" },
        "20%,50%": { opacity: "0" }
    }
} satisfies ThemeConfig["keyframes"]
