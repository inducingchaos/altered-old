/**
 *
 */

import type { PathsConfig } from "@sdkit/config"

export const paths = {
    pages: {
        root: "/"
    },
    assets: {
        favicon: "/brand/favicon.png"
    },
    api: {
        base: "/api",
        endpoints: {}
    }
} satisfies PathsConfig
