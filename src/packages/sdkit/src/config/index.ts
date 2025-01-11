/**
 *
 */

import type { BrandConfig } from "./brand"
import type { MiscConfig } from "./misc"
import type { PathsConfig } from "./paths"

export type Config = {
    brand: BrandConfig
    paths: PathsConfig
    misc: MiscConfig
}

export * from "./brand"
export * from "./misc"
export * from "./paths"
