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
import { setTempValue } from "~/server/utils/alias-manager"

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
                TEMP_devNotes?: string
            }
        ]

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
                alias: thought.TEMP_alias,
                devNotes: thought.TEMP_devNotes
            }
        })

        // Insert the thoughts
        await db.insert(thoughtsSchema).values(
            thoughtsToCreate.map(thought => ({
                id: thought.id,
                content: thought.content,
                userId: thought.userId
            }))
        )

        // Save all temp values for each thought
        await Promise.all(
            thoughtsToCreate.flatMap(thought => {
                const tempValues = []

                // Save alias as temp value if provided
                if (thought.alias) {
                    tempValues.push(setTempValue(thought.id, "alias", thought.alias))
                }

                // Save dev notes as temp value if provided
                if (thought.devNotes) {
                    tempValues.push(setTempValue(thought.id, "dev-notes", thought.devNotes))
                }

                // Save other temp values from the original payload
                const originalThought = payload.find(p => p.TEMP_content === thought.content)
                if (originalThought) {
                    if (originalThought.TEMP_priority) {
                        tempValues.push(setTempValue(thought.id, "priority", String(originalThought.TEMP_priority)))
                    }

                    if (originalThought.TEMP_sensitive !== undefined) {
                        tempValues.push(setTempValue(thought.id, "sensitive", String(originalThought.TEMP_sensitive)))
                    }

                    if (originalThought.TEMP_datasets && originalThought.TEMP_datasets.length > 0) {
                        tempValues.push(setTempValue(thought.id, "datasets", JSON.stringify(originalThought.TEMP_datasets)))
                    }
                }

                return tempValues
            })
        )

        //  MOVE THE ALIAS GEN TO AN "AFTER" run with Vercel

        let thoughtsNeedingAliases = thoughtsToCreate.filter(thought => !thought.alias) as (Thought & {
            alias?: string
            devNotes?: string
        })[]

        // Generate aliases for newly created thoughts if auto-generation is enabled
        const isAliasEnabled = await isAliasGenerationEnabled()

        if (isAliasEnabled) {
            // Generate aliases for the newly created thoughts
            thoughtsNeedingAliases = await ensureThoughtsAliases(thoughtsNeedingAliases)
        }

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
