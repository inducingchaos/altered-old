/**
 * API route for listing all AI features
 */
import { and, eq, like } from "drizzle-orm"
import { NextResponse, type NextRequest } from "next/server"
import { Exception } from "~/packages/sdkit/src/meta"
import { createNetworkResponse } from "~/packages/sdkit/src/utils/network"
import { db } from "~/server/data"
import { temp } from "~/server/data/schemas/iiinput/temp"
import {
    DEFAULT_MODEL_IDS,
    FEATURE_DESCRIPTIONS,
    MODEL_PREFERENCE_KEY_PREFIX,
    MODEL_PREFERENCES_THOUGHT_ID,
    type AIFeature,
    type ModelID
} from "~/server/config/ai/models"

function isAuthedSimple(request: NextRequest): boolean {
    const authHeader = request.headers.get("Authorization")
    return authHeader === `Bearer ${process.env.SIMPLE_INTERNAL_SECRET}`
}

// Helper to get current model preferences for all features
async function getAllModelPreferences(): Promise<Map<AIFeature, ModelID>> {
    // Get all preferences
    const allPreferences = await db.query.temp.findMany({
        where: and(eq(temp.thoughtId, MODEL_PREFERENCES_THOUGHT_ID), like(temp.key, `${MODEL_PREFERENCE_KEY_PREFIX}-%`))
    })

    // Map of feature to model preference
    const preferencesMap = new Map<AIFeature, ModelID>()

    // Process preferences
    for (const pref of allPreferences) {
        // Extract feature from key (e.g., "model-preference-thought-generation" -> "thought-generation")
        const feature = pref.key.substring(MODEL_PREFERENCE_KEY_PREFIX.length + 1) as AIFeature
        if (feature) {
            preferencesMap.set(feature, pref.value as ModelID)
        }
    }

    return preferencesMap
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

        // Get all model preferences
        const preferencesMap = await getAllModelPreferences()

        // Build response with feature information
        const featuresInfo = Object.entries(DEFAULT_MODEL_IDS).map(([feature, defaultModelId]) => {
            const featureKey = feature as AIFeature
            const preferredModelId = preferencesMap.get(featureKey) ?? defaultModelId
            const isDefault = !preferencesMap.has(featureKey)

            return {
                id: featureKey,
                description: FEATURE_DESCRIPTIONS[featureKey],
                model: {
                    id: preferredModelId,
                    isDefault
                }
            }
        })

        // Return features as a direct array
        return NextResponse.json(featuresInfo)
    } catch (error) {
        console.error("Error retrieving features:", error)

        if (error instanceof Exception) {
            return createNetworkResponse({ using: error })
        }

        return NextResponse.json({ error: "Failed to retrieve features." }, { status: 500 })
    }
}
