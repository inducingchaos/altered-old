/**
 *
 */

import type { Config } from "@sdkit/config"
import { brand } from "./brand"
import { misc } from "./misc"
import { paths } from "./paths"

export const projects = ["ALTERED", "iiinput"] as const
export type Project = (typeof projects)[number]

export default {
    brand,
    paths,
    misc
} satisfies Config
