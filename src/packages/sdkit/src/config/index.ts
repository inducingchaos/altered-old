/**
 *
 */

import type { BrandConfig } from "./brand"
import type { MiscConfig } from "./misc"
import type { PathsConfig } from "./paths"
import type { SecurityConfig } from "./security"
import type { LocalizationConfig } from "./localization"

export type Config = {
    brand: BrandConfig
    paths: PathsConfig
    security: SecurityConfig
    misc: MiscConfig
    localization: LocalizationConfig
}

export * from "./brand"
export * from "./misc"
export * from "./paths"
export * from "./security"
export * from "./localization"
