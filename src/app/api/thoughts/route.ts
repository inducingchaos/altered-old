/**
 * API routes for thoughts
 */

// copied over from generate

import { desc, eq } from "drizzle-orm"
import Fuse from "fuse.js"
import { NextResponse, type NextRequest } from "next/server"
import { Exception, type NetworkExceptionID } from "~/packages/sdkit/src/meta"
import { createNetworkResponse } from "~/packages/sdkit/src/utils/network"
import { db } from "~/server/data"
import { thoughts } from "~/server/data/schemas/iiinput"
import type { Thought } from "~/server/data/schemas/iiinput/thoughts"

export function isAuthedSimple(request: NextRequest): boolean {
    const authHeader = request.headers.get("Authorization")
    return authHeader === `Bearer ${process.env.SIMPLE_INTERNAL_SECRET}`
}

type ThoughtWithAlias = Thought & { alias?: string; "dev-notes"?: string }
type CamelCaseThoughtWithAlias = Thought & { alias?: string; devNotes?: string }

type PaginationParams = {
    limit?: number
    offset?: number
}

export async function getAllThoughts(query?: string, pagination?: PaginationParams): Promise<CamelCaseThoughtWithAlias[]> {
    const userId = process.env.ME ?? ""
    const { limit = 25, offset = 0 } = pagination ?? {}

    // let isEnd = false

    let allThoughts = await db.query.thoughts.findMany({
        with: {
            tempValues: true
        },
        where: eq(thoughts.userId, userId),
        orderBy: desc(thoughts.updatedAt),
        limit: query ? undefined : limit,
        offset: query ? undefined : offset
    })

    if (allThoughts.length < limit) {
        // isEnd = true
    }

    // move FUSE filtering here to avoid unnecessary updates

    if (query) {
        const fuse = new Fuse(allThoughts, {
            keys: ["content", "alias", "dev-notes"],
            threshold: 0.4,
            includeScore: true
        })
        const searchResults = fuse.search(query)
        // manually implement pagination
        allThoughts = searchResults.map(result => result.item).slice(offset, offset + limit)

        if (searchResults.length < limit) {
            // isEnd = true
        }
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

    // re-map to camelCase
    const thoughtsWithAliasesCamelCase = thoughtsWithAliases.map(t => {
        const camelCaseObject: Record<string, unknown> = {}
        for (const [key, value] of Object.entries(t)) {
            const camelCaseKey = key.replace(/-([a-z])/g, (_, letter) => (letter as string).toUpperCase())
            camelCaseObject[camelCaseKey] = value
        }
        return camelCaseObject as CamelCaseThoughtWithAlias
    })

    // We no longer need to generate aliases here as they should be created at thought creation time
    // This just returns the thoughts with their existing aliases

    return thoughtsWithAliasesCamelCase
}

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
        const query = searchParams.get("search") ?? undefined
        const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : undefined
        const offset = searchParams.get("offset") ? parseInt(searchParams.get("offset")!) : undefined

        // Validate pagination parameters
        if (limit !== undefined && (isNaN(limit) || limit < 1 || limit > 100)) {
            return NextResponse.json({ error: "Limit must be between 1 and 100." }, { status: 400 })
        }

        if (offset !== undefined && (isNaN(offset) || offset < 0)) {
            return NextResponse.json({ error: "Offset must be a non-negative number." }, { status: 400 })
        }

        const thoughts = await getAllThoughts(query, { limit, offset })

        return NextResponse.json(thoughts)
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
