/**
 * API route for listing all AI features
 */
import { NextResponse, type NextRequest } from "next/server"
import { Exception } from "~/packages/sdkit/src/meta"
import { createNetworkResponse } from "~/packages/sdkit/src/utils/network"
import { DEFAULT_MODEL_IDS, FEATURE_DESCRIPTIONS, MODEL_INFO, type AIFeature } from "~/server/config/ai/models"

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

        // Build response with feature information
        const featuresInfo = Object.entries(DEFAULT_MODEL_IDS).map(([feature, defaultModelId]) => {
            const featureKey = feature as AIFeature
            return {
                feature: featureKey,
                description: FEATURE_DESCRIPTIONS[featureKey],
                defaultModel: MODEL_INFO[defaultModelId]
            }
        })

        return NextResponse.json({ features: featuresInfo })
    } catch (error) {
        console.error("Error retrieving features:", error)

        if (error instanceof Exception) {
            return createNetworkResponse({ using: error })
        }

        return NextResponse.json({ error: "Failed to retrieve features." }, { status: 500 })
    }
}
