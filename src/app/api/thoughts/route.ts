/**
 * API routes for thoughts
 */

// copied over from generate

import { eq } from "drizzle-orm"
import Fuse from "fuse.js"
import { NextResponse, type NextRequest } from "next/server"
import { Exception, type NetworkExceptionID } from "~/packages/sdkit/src/meta"
import { createNetworkResponse } from "~/packages/sdkit/src/utils/network"
import { db } from "~/server/data"
import { thoughts } from "~/server/data/schemas/iiinput"
import type { Thought } from "~/server/data/schemas/iiinput/thoughts"
import { ensureThoughtsAliases } from "~/server/utils/alias-generator"

function isAuthedSimple(request: NextRequest): boolean {
    const authHeader = request.headers.get("Authorization")
    return authHeader === `Bearer ${process.env.SIMPLE_INTERNAL_SECRET}`
}

type ThoughtWithAlias = Thought & { alias?: string }

export async function GET(request: NextRequest): Promise<NextResponse> {
    try {
        if (!isAuthedSimple(request)) {
            return createNetworkResponse({
                using: {
                    status: "UNAUTHORIZED",
                    message: "Failed To Run Command: Invalid authorization header."
                }
            })
        }

        const searchParams = request.nextUrl.searchParams
        const query = searchParams.get("search")

        const userId = process.env.ME ?? ""

        // if no query, limit to 25
        const limit = query ? undefined : 25

        let allThoughts = await db.query.thoughts.findMany({
            with: {
                tempValues: true
            },
            where: eq(thoughts.userId, userId),
            limit
        })

        // move FUSE filtering here to avoid unnecessary updates

        if (query) {
            const fuse = new Fuse(allThoughts, {
                keys: ["content", "alias"],
                threshold: 0.4,
                includeScore: true
            })
            const searchResults = fuse.search(query)
            allThoughts = searchResults.map(result => result.item)
        }

        // remap thoughts to have alias top level w/o tempValues
        const thoughtsWithAliases = allThoughts.map(
            t =>
                ({
                    ...Object.fromEntries(Object.entries(t).filter(([key]) => key !== "tempValues")),
                    ...Object.fromEntries(
                        t.tempValues.map(tv => {
                            // Try to parse JSON strings for arrays and objects
                            const value = tv.value
                            try {
                                // Check if the value looks like JSON
                                if (value && (value.startsWith("[") || value.startsWith("{"))) {
                                    const parsed = JSON.parse(value) as unknown
                                    return [tv.key, parsed]
                                }
                            } catch {
                                // If parsing fails, return the original string
                            }
                            return [tv.key, value]
                        })
                    )
                }) as ThoughtWithAlias & Record<string, unknown>
        )

        // Generate aliases for thoughts that need them
        // First, filter out thoughts that need aliases
        const thoughtsNeedingAliases = thoughtsWithAliases.filter(t => t.alias === undefined)

        // Then generate aliases for them
        const updatedThoughts = await ensureThoughtsAliases(thoughtsNeedingAliases)

        const thoughtsWithGuaranteedAliases = thoughtsWithAliases.map(original => {
            if (!original.alias) {
                const updated = updatedThoughts.find(updated => updated.id === original.id)
                if (updated && updated.alias) {
                    return { ...original, alias: updated.alias }
                }
            }
            return original
        })

        const sortedThoughts = thoughtsWithGuaranteedAliases
            .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
            .slice(0, 25)

        return NextResponse.json(sortedThoughts)
    } catch (error) {
        console.error("Error fetching thoughts:", error)

        if (error instanceof Exception) {
            return createNetworkResponse({
                from: { exception: error as unknown as Exception<"network", NetworkExceptionID> }
            })
        }

        return NextResponse.json({ error: "Failed to fetch thoughts." }, { status: 500 })
    }
}
