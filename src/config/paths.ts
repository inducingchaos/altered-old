/**
 *
 */

import type { PathsConfig } from "@sdkit/config"

export const paths = {
    pages: {
        root: "/"
    },
    assets: {
        favicon: "/brand/favicon.png",
        appIcon: "/brand/app-icon-512x512.png",
        workers: {
            notifications: "/workers/notifications.js"
        }
    },
    api: {
        base: "/api",
        endpoints: {}
    }
} satisfies PathsConfig
