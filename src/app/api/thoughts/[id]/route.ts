/**
 * Raycast API routes for thoughts with ID
 */

// spell-checker: disable

import { NextResponse, type NextRequest } from "next/server"
import { Exception, type NetworkExceptionID } from "~/packages/sdkit/src/meta"
import { createNetworkResponse } from "~/packages/sdkit/src/utils/network"
import { db } from "~/server/data"
import { thoughts as thoughtsSchema } from "~/server/data/schemas/iiinput/thoughts"
import { eq } from "drizzle-orm"

function isAuthedSimple(request: NextRequest): boolean {
    const authHeader = request.headers.get("Authorization")
    console.error("Received request with auth header:", authHeader, "Expected:", `Bearer ${process.env.SIMPLE_INTERNAL_SECRET}`)

    return authHeader === `Bearer ${process.env.SIMPLE_INTERNAL_SECRET}`
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> {
    try {
        if (!isAuthedSimple(request)) {
            return createNetworkResponse({
                using: {
                    status: "UNAUTHORIZED",
                    message: "Failed To Run Command: Invalid authorization header."
                }
            })
        }

        const { id: thoughtId } = await params

        console.log("Deleting thought: ", thoughtId)

        if (!thoughtId) {
            throw new Exception({
                in: "network",
                of: "bad-request",
                with: {
                    external: {
                        label: "Bad Request",
                        message: "Missing required 'id' parameter."
                    },
                    internal: {
                        label: "Bad Request",
                        message: "Missing required 'id' parameter."
                    }
                }
            })
        }

        // Delete the thought with the specified ID
        const result = await db.delete(thoughtsSchema).where(eq(thoughtsSchema.id, thoughtId))

        // Check if any rows were affected
        if (!result || result.rowsAffected === 0) {
            return NextResponse.json({ message: "Thought not found or already deleted." }, { status: 404 })
        }

        return NextResponse.json({
            message: "Thought deleted successfully.",
            thoughtId
        })
    } catch (error) {
        if (error instanceof Exception) {
            // fix typings here

            return createNetworkResponse({ from: { exception: error as unknown as Exception<"network", NetworkExceptionID> } })
        }

        return NextResponse.json({ error: "Failed to delete thought." }, { status: 500 })
    }
}
