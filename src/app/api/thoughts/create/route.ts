/**
 * Raycast ingest API routes for thoughts
 */

// spell-checker: disable

import { nanoid } from "nanoid"
import { NextResponse, type NextRequest } from "next/server"
import { Exception } from "~/packages/sdkit/src/meta"
import { createNetworkResponse } from "~/packages/sdkit/src/utils/network"
import { db } from "~/server/data"
import type { Thought } from "~/server/data/schemas/iiinput/thoughts"
import { thoughts as thoughtsSchema } from "~/server/data/schemas/iiinput/thoughts"
import { ensureThoughtsAliases, isAliasGenerationEnabled } from "~/server/utils/alias-generator"

function isAuthedSimple(request: NextRequest): boolean {
    const authHeader = request.headers.get("Authorization")
    console.error("Recieved request with auth header:", authHeader, "Expected:", `Bearer ${process.env.SIMPLE_INTERNAL_SECRET}`)

    return authHeader === `Bearer ${process.env.SIMPLE_INTERNAL_SECRET}`
}

export async function POST(request: NextRequest): Promise<NextResponse> {
    try {
        if (!isAuthedSimple(request)) {
            return createNetworkResponse({
                using: {
                    status: "UNAUTHORIZED",
                    message: "Failed To Run Command: Invalid authorization header."
                }
            })
        }

        const payload = (await request.json()) as [
            {
                TEMP_content: string
                TEMP_alias: string
                TEMP_priority: number
                TEMP_sensitive: boolean
                TEMP_datasets: string[]
            }
        ]

        console.log("payload", payload)

        if (!payload.length)
            throw new Exception({
                in: "network",
                of: "bad-request",
                with: {
                    external: {
                        label: "Bad Request",
                        message: "The request body is missing the required 'thought' field."
                    },
                    internal: {
                        label: "Bad Request",
                        message: "The request body is missing the required 'thought' field."
                    }
                }
            })

        // Create thoughts with pre-generated IDs so we know them before insertion
        const thoughtsToCreate = payload.map(thought => {
            const id = nanoid()
            return {
                id,
                content: thought.TEMP_content,
                userId: process.env.ME!,
                alias: thought.TEMP_alias
            }
        })

        // Insert the thoughts
        await db.insert(thoughtsSchema).values(thoughtsToCreate)

        //  MOVE THE ALIAS GEN TO AN "AFTER" run with Vercel

        let thoughtsNeedingAliases = thoughtsToCreate.filter(thought => !thought.alias) as (Thought & { alias?: string })[]

        // Generate aliases for newly created thoughts if auto-generation is enabled
        const isAliasEnabled = await isAliasGenerationEnabled()

        if (isAliasEnabled) {
            // Generate aliases for the newly created thoughts
            thoughtsNeedingAliases = await ensureThoughtsAliases(thoughtsNeedingAliases)
        }

        console.log("thoughtsNeedingAliases", thoughtsNeedingAliases)

        return NextResponse.json([
            ...thoughtsNeedingAliases,
            ...thoughtsToCreate.filter(thought => !thoughtsNeedingAliases.some(aliasThought => aliasThought.id === thought.id))
        ])
    } catch (error) {
        if (error instanceof Exception) {
            return createNetworkResponse({ using: error })
        }

        console.error("Error creating thought:", error)

        return NextResponse.json({ error: "Failed to create thought." }, { status: 500 })
    }
}
