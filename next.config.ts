/**
 *
 */

import type { NextConfig } from "next"
import type { Header } from "next/dist/lib/load-custom-routes"

export default {
    experimental: {
        ppr: true,
        dynamicIO: true,
        authInterrupts: true
    },
    typescript: { ignoreBuildErrors: true },
    eslint: { ignoreDuringBuilds: true },
    async headers(): Promise<Header[]> {
        return [
            {
                source: "/(.*)",
                headers: [
                    {
                        key: "X-Content-Type-Options",
                        value: "nosniff"
                    },
                    {
                        key: "X-Frame-Options",
                        value: "DENY"
                    },
                    {
                        key: "Referrer-Policy",
                        value: "strict-origin-when-cross-origin"
                    }
                ]
            },
            {
                source: "/workers/notifications.js",
                headers: [
                    {
                        key: "Service-Worker-Allowed",
                        value: "/"
                    },
                    {
                        key: "Content-Type",
                        value: "application/javascript; charset=utf-8"
                    },
                    {
                        key: "Cache-Control",
                        value: "no-cache, no-store, must-revalidate"
                    },
                    {
                        key: "Content-Security-Policy",
                        value: "default-src 'self'; script-src 'self'"
                    }
                ]
            }
        ]
    }
} satisfies NextConfig
