/**
 * Raycast ingest API routes for thoughts
 */

// spell-checker: disable

import { NextResponse, type NextRequest } from "next/server"
import { Exception } from "~/packages/sdkit/src/meta"
import { createNetworkResponse } from "~/packages/sdkit/src/utils/network"
import { db } from "~/server/data"
import { thoughts as thoughtsSchema } from "~/server/data/schemas/iiinput/thoughts"

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

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const thoughts = payload.map(thought => ({
            content: thought.TEMP_content,

            userId: process.env.ME!
        }))

        // if (!thoughtData.content || !thoughtData.userId)
        //     throw new Exception({
        //         in: "network",
        //         of: "bad-request",
        //         with: {
        //             external: {
        //                 label: "Bad Request",
        //                 message: "The request body is missing the required 'content' and 'userId' fields."
        //             },
        //             internal: {
        //                 label: "Bad Request",
        //                 message: "The request body is missing the required 'content' and 'userId' fields."
        //             }
        //         }
        //     })

        await db.insert(thoughtsSchema).values(thoughts)

        return NextResponse.json(thoughts)
    } catch (error) {
        if (error instanceof Exception) {
            return createNetworkResponse({ using: error })
        }

        return NextResponse.json({ error: "Failed to create thought." }, { status: 500 })
    }
}
