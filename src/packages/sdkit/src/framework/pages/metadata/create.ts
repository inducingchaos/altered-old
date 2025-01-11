/**
 *
 */

import type { Config } from "@sdkit/config"
import type { Metadata } from "next"
import { createMetadataTitle } from "./title"

export function createPageMetadata({ using: config }: { using: Config }): Metadata {
    const title = createMetadataTitle({ using: config })
    const description = config.brand.info.description

    return {
        title,
        description,
        icons: config.paths.assets.favicon,
        keywords: null,
        openGraph: {
            title,
            description,
            images: config.paths.assets.og,
            type: "website"
        }
    }
}
