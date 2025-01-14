/**
 *
 */

import { Vercel } from "@vercel/sdk"

export const vercel = new Vercel({
    bearerToken: process.env.VERCEL_SECRET
})
