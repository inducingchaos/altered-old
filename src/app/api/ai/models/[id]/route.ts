/**
 * API route for retrieving information about a specific AI model
 */
import { NextResponse, type NextRequest } from "next/server"
import { Exception } from "~/packages/sdkit/src/meta"
import { createNetworkResponse } from "~/packages/sdkit/src/utils/network"
import { MODEL_INFO, ALLOWED_MODEL_IDS, type ModelID } from "~/server/config/ai/models"

function isAuthedSimple(request: NextRequest): boolean {
    const authHeader = request.headers.get("Authorization")
    return authHeader === `Bearer ${process.env.SIMPLE_INTERNAL_SECRET}`
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }): Promise<NextResponse> {
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

        const { id } = params

        // Validate model ID
        if (!ALLOWED_MODEL_IDS.includes(id as ModelID)) {
            return NextResponse.json({ error: `Invalid model ID: ${id}` }, { status: 400 })
        }

        const modelId = id as ModelID
        const modelInfo = MODEL_INFO[modelId]

        return NextResponse.json({ model: modelInfo })
    } catch (error) {
        console.error(`Error retrieving model with ID ${params.id}:`, error)

        if (error instanceof Exception) {
            return createNetworkResponse({ using: error })
        }

        return NextResponse.json({ error: "Failed to retrieve model information." }, { status: 500 })
    }
}
