/**
 *
 */

import type { ThemeConfig } from "tailwindcss/types/config"

export const animation = {
    "navigation-menu-enter": "navigation-menu-enter 0.25s var(--ease-out)",
    "navigation-menu-exit": "navigation-menu-exit 0.25s var(--ease-out)",

    "otp-caret-blink": "otp-caret-blink 1.25s ease-out infinite"
} satisfies ThemeConfig["animation"]
