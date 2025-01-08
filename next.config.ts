/**
 *
 */

import type { NextConfig } from "next"

export default {
    experimental: {
        ppr: true,
        dynamicIO: true
    },
    typescript: { ignoreBuildErrors: true },
    eslint: { ignoreDuringBuilds: true }
} satisfies NextConfig
