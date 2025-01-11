/**
 *
 */

import type { Config } from "@sdkit/config"
import { getSeparator } from "@sdkit/utils/templating"

export function createMetadataTitle({ using: config }: { using: Config }): string {
    if (config.misc.includeTaglineInTitle === false) return config.brand.info.name

    return `${config.brand.info.name}${getSeparator({ for: config.misc.metadataTitleSeparator ?? "pipe" })}${config.brand.info.tagline}`
}
