/**
 *
 */

import type { MetadataRoute } from "next"
import config from "~/config"

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: config.brand.info.name,
        short_name: config.brand.info.name,
        description: config.brand.info.description,
        start_url: "/pwa",
        display: "standalone",
        background_color: "#101010",
        theme_color: "#FF0000",
        icons: [
            {
                src: "/brand/app-icon-192x192.png",
                sizes: "192x192",
                type: "image/png"
            },
            {
                src: "/brand/app-icon-512x512.png",
                sizes: "512x512",
                type: "image/png"
            }
        ]
    }
}
