/**
 * API route for retrieving information about a specific AI feature
 */
import { NextResponse, type NextRequest } from "next/server"
import { Exception } from "~/packages/sdkit/src/meta"
import { createNetworkResponse } from "~/packages/sdkit/src/utils/network"
import { DEFAULT_MODEL_IDS, FEATURE_DESCRIPTIONS, MODEL_INFO, type AIFeature } from "~/server/config/ai/models"

function isAuthedSimple(request: NextRequest): boolean {
    const authHeader = request.headers.get("Authorization")
    return authHeader === `Bearer ${process.env.SIMPLE_INTERNAL_SECRET}`
}

// Helper to validate if a string is a valid AIFeature
function isValidFeature(feature: string): feature is AIFeature {
    return feature in DEFAULT_MODEL_IDS
}

export async function GET(request: NextRequest, { params }: { params: { name: string } }): Promise<NextResponse> {
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

        const { name } = params

        // Validate feature name
        if (!isValidFeature(name)) {
            return NextResponse.json({ error: `Invalid feature: ${name}` }, { status: 400 })
        }

        // Since we've validated with isValidFeature, name is now AIFeature type
        const defaultModelId = DEFAULT_MODEL_IDS[name]

        return NextResponse.json({
            feature: name,
            description: FEATURE_DESCRIPTIONS[name],
            defaultModel: MODEL_INFO[defaultModelId]
        })
    } catch (error) {
        console.error(`Error retrieving feature ${params.name}:`, error)

        if (error instanceof Exception) {
            return createNetworkResponse({ using: error })
        }

        return NextResponse.json({ error: "Failed to retrieve feature information." }, { status: 500 })
    }
}
