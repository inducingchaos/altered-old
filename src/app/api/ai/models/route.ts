/**
 * API route for listing all available AI models
 */
import { NextResponse, type NextRequest } from "next/server"
import { Exception } from "~/packages/sdkit/src/meta"
import { createNetworkResponse } from "~/packages/sdkit/src/utils/network"
import { MODEL_INFO } from "~/server/config/ai/models"

function isAuthedSimple(request: NextRequest): boolean {
    const authHeader = request.headers.get("Authorization")
    return authHeader === `Bearer ${process.env.SIMPLE_INTERNAL_SECRET}`
}

export async function GET(request: NextRequest): Promise<NextResponse> {
    try {
        // Check authentication
        if (!isAuthedSimple(request)) {
            return createNetworkResponse({
                using: {
                    status: "UNAUTHORIZED",
                    message: "Failed To Run Command: Invalid authorization header."
                }
            })
        }

        // Return all available models with their information
        return NextResponse.json({ models: Object.values(MODEL_INFO) })
    } catch (error) {
        console.error("Error retrieving models:", error)

        if (error instanceof Exception) {
            return createNetworkResponse({ using: error })
        }

        return NextResponse.json({ error: "Failed to retrieve models." }, { status: 500 })
    }
}
