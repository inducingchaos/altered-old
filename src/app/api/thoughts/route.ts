/**
 * API routes for thoughts
 */

// copied over from generate

import { desc, eq, count } from "drizzle-orm"
import Fuse from "fuse.js"
import { NextResponse, type NextRequest } from "next/server"
import { Exception, type NetworkExceptionID } from "~/packages/sdkit/src/meta"
import { createNetworkResponse } from "~/packages/sdkit/src/utils/network"
import { db } from "~/server/data"
import { thoughts } from "~/server/data/schemas/iiinput"
import type { Thought } from "~/server/data/schemas/iiinput/thoughts"
import type { Temp } from "~/server/data/schemas/iiinput/temp"

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

type FilterParams = {
    validated?: boolean
    datasetId?: string
}

type ThoughtWithTemp = Thought & {
    tempValues: Temp[]
}

export async function getAllThoughts(
    query?: string,
    pagination?: PaginationParams,
    filters?: FilterParams
): Promise<{
    thoughts: CamelCaseThoughtWithAlias[]
    total: number
}> {
    const userId = process.env.ME ?? ""
    const { limit = 25, offset = 0 } = pagination ?? {}
    const { validated, datasetId } = filters ?? {}

    let totalCount = 0
    let allThoughts: ThoughtWithTemp[] = []

    // Filter by validation status and dataset if needed
    const filterThoughts = (thoughts: ThoughtWithTemp[]): ThoughtWithTemp[] => {
        let filtered = thoughts

        // Filter by validation status if specified
        if (validated !== undefined) {
            filtered = filtered.filter(t => {
                const validatedValue = t.tempValues.find(tv => tv.key === "validated")?.value
                // If no validation value exists, treat as false
                if (!validatedValue) {
                    return validated === false
                }
                return validatedValue === String(validated)
            })
        }

        // Filter by dataset if specified
        if (datasetId) {
            filtered = filtered.filter(t => {
                const datasetsValue = t.tempValues.find(tv => tv.key === "datasets")?.value
                try {
                    const datasets = JSON.parse(String(datasetsValue ?? "[]")) as string[]
                    return datasets.includes(datasetId)
                } catch {
                    return false
                }
            })
        }

        return filtered
    }

    // Get all thoughts if we need filtering
    if (query || validated !== undefined || datasetId) {
        // Get all thoughts since we need to filter
        allThoughts = await db.query.thoughts.findMany({
            with: {
                tempValues: true
            },
            where: eq(thoughts.userId, userId),
            orderBy: desc(thoughts.updatedAt)
        })

        let filteredThoughts = allThoughts

        // Apply filters if any
        if (validated !== undefined || datasetId) {
            filteredThoughts = filterThoughts(filteredThoughts)
        }

        // Apply search if any
        if (query) {
            const fuse = new Fuse(filteredThoughts, {
                keys: [
                    "content",
                    {
                        name: "tempValues",
                        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
                        getFn: thought => {
                            const alias = thought.tempValues.find(tv => tv.key === "alias")?.value ?? ""
                            const devNotes = thought.tempValues.find(tv => tv.key === "dev-notes")?.value ?? ""
                            return `${alias} ${devNotes}`
                        }
                    }
                ],
                threshold: 0.4,
                includeScore: true
            })
            const searchResults = fuse.search(query)
            filteredThoughts = searchResults.map(result => result.item)
        }

        // Get total count before pagination
        totalCount = filteredThoughts.length

        // Apply pagination after filtering/searching
        allThoughts = filteredThoughts.slice(offset, offset + limit)
    } else {
        // No filters or search, we can use the DB-level pagination and count
        const countResult = await db.select({ count: count() }).from(thoughts)
        totalCount = countResult[0]?.count ?? 0

        // Get paginated thoughts
        allThoughts = await db.query.thoughts.findMany({
            with: {
                tempValues: true
            },
            where: eq(thoughts.userId, userId),
            orderBy: desc(thoughts.updatedAt),
            limit,
            offset
        })
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

    // DO NOT DELETE THIS COMMENT: We no longer need to generate aliases here as they should be created at thought creation time
    // This just returns the thoughts with their existing aliases

    return {
        thoughts: thoughtsWithAliasesCamelCase,
        total: totalCount
    }
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

        // Parse new filter params
        const validatedParam = searchParams.get("validated")
        const validated = validatedParam === "true" ? true : validatedParam === "false" ? false : undefined
        const dataset = searchParams.get("dataset") ?? undefined

        // Validate pagination parameters
        if (limit !== undefined && (isNaN(limit) || limit < 1 || limit > 100)) {
            return NextResponse.json({ error: "Limit must be between 1 and 100." }, { status: 400 })
        }

        if (offset !== undefined && (isNaN(offset) || offset < 0)) {
            return NextResponse.json({ error: "Offset must be a non-negative number." }, { status: 400 })
        }

        const { thoughts, total } = await getAllThoughts(query, { limit, offset }, { validated, datasetId: dataset })

        // Calculate position based on offset and total
        let position: "start" | "delta" | "end" = "delta"
        const effectiveOffset = offset ?? 0
        if (effectiveOffset === 0) {
            position = "start"
        } else if (effectiveOffset + (limit ?? 25) >= total) {
            position = "end"
        }

        return NextResponse.json({
            thoughts,
            position,
            total
        })
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
