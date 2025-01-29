/**
 * Raycast ingest API routes for thoughts
 */

import { type NextRequest, NextResponse } from "next/server"
import { Exception } from "~/packages/sdkit/src/meta"
import { createNetworkResponse } from "~/packages/sdkit/src/utils/network"
import { db } from "~/server/data"
import { createThought, getThoughts } from "~/server/data/access/iiinput/thoughts"
import type { CreatableThought } from "~/server/data/schemas/iiinput"
import Fuse from "fuse.js"

export async function POST(request: NextRequest): Promise<NextResponse> {
    try {
        const payload = (await request.json()) as { thought: CreatableThought }

        if (!("thought" in payload))
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

        const thoughtData = payload.thought

        if (!thoughtData.content || !thoughtData.userId)
            throw new Exception({
                in: "network",
                of: "bad-request",
                with: {
                    external: {
                        label: "Bad Request",
                        message: "The request body is missing the required 'content' and 'userId' fields."
                    },
                    internal: {
                        label: "Bad Request",
                        message: "The request body is missing the required 'content' and 'userId' fields."
                    }
                }
            })

        const thought = await createThought({
            using: thoughtData,
            in: db
        })

        return NextResponse.json(thought)
    } catch (error) {
        if (error instanceof Exception) {
            return createNetworkResponse({ using: error })
        }

        return NextResponse.json({ error: "Failed to create thought." }, { status: 500 })
    }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
    try {
        const searchParams = new URL(request.url).searchParams
        const query = searchParams.get("q") ?? ""

        const allThoughts = await getThoughts({
            where: {
                userId: process.env.USER_ID
            },
            from: db
        })

        if (query) {
            const fuse = new Fuse(allThoughts, {
                keys: ["content"],
                threshold: 0.4,
                includeScore: true
            })

            const searchResults = fuse.search(query)
            const matchedThoughts = searchResults.map(result => result.item)

            const sortedThoughts = matchedThoughts.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()).slice(0, 25)

            return NextResponse.json(sortedThoughts)
        }

        const recentThoughts = allThoughts.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()).slice(0, 25)

        return NextResponse.json(recentThoughts)
    } catch {
        return NextResponse.json({ error: "Failed to fetch thoughts." }, { status: 500 })
    }
}
