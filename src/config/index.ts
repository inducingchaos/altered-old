/**
 *
 */

import type { Config } from "@sdkit/config"
import { brand } from "./brand"
import { misc } from "./misc"
import { paths } from "./paths"
import { security } from "./security"
import { localization } from "./localization"

export const projects = ["ALTERED", "iiinput"] as const
export type Project = (typeof projects)[number]

export default {
    brand,
    paths,
    security,
    localization,
    misc
} satisfies Config
