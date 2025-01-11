/**
 *
 */

import typography from "@tailwindcss/typography"
import { type Config } from "tailwindcss"
import animate from "tailwindcss-animate"

import {
    animation,
    backdropBlur,
    borderRadius,
    borderWidth,
    colors,
    fontFamily,
    fontSize,
    keyframes,
    opacity,
    spacing,
    transitionDuration,
    transitionTimingFunction
} from "./src/packages/sdkit/src/defaults/config/external/tailwind"

export default {
    darkMode: ["class"],
    content: ["./src/{app,components,domains,_ignore/experimental}/**/*.{js,ts,jsx,tsx,mdx}"],

    theme: {
        spacing,
        opacity,

        fontFamily,
        fontSize,

        borderWidth,
        borderRadius,

        transitionDuration,
        transitionTimingFunction,

        backdropBlur,
        extend: {
            colors,

            animation,
            keyframes
        }
    },

    plugins: [animate, typography]
} satisfies Config
