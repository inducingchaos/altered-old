/**
 *
 */

import { z } from "zod"

export const schema = z.object({
    info: z.object({
        name: z.string(),
        tagline: z.string().optional(),
        description: z.string().optional()
    }),

    emails: z.object({
        system: z.string().email(),
        marketing: z.string().email().optional(),
        support: z.string().email().optional()
    }),

    links: z.object({
        site: z.string().url(),
        x: z.string().url().optional(),
        instagram: z.string().url().optional(),
        tiktok: z.string().url().optional(),
        github: z.string().url().optional()
    })
})

export type BrandConfig = z.input<typeof schema>
