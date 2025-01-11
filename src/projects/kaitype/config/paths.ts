/**
 *
 */

import type { PathsConfig } from "@sdkit/config"

export const paths = {
    pages: {
        root: "/"
    },
    assets: {
        favicon: "/kaitype/brand/favicon.png",
        og: "/kaitype/brand/ssi.png"
    },
    api: {
        base: "/api",
        endpoints: {}
    }
} satisfies PathsConfig
