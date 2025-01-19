/**
 *
 */

import type { Config } from "@sdkit/config"
import { brand } from "./brand"
import { localization } from "./localization"
import { misc } from "./misc"
import { paths } from "./paths"
import { security } from "./security"

export default {
    brand,
    paths,
    security,
    localization,
    misc
} satisfies Config
