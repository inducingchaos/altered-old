/**
 * API route for retrieving and updating information about a specific AI feature
 */
import { and, eq } from "drizzle-orm"
import { NextResponse, type NextRequest } from "next/server"
import { Exception } from "~/packages/sdkit/src/meta"
import { createNetworkResponse } from "~/packages/sdkit/src/utils/network"
import { db } from "~/server/data"
import { temp } from "~/server/data/schemas/iiinput/temp"
import {
    FEATURES,
    MODEL_PREFERENCE_KEY_PREFIX,
    MODEL_PREFERENCES_THOUGHT_ID,
    ALLOWED_MODEL_IDS,
    type AIFeature,
    type ModelID
} from "~/server/config/ai/models"

function isAuthedSimple(request: NextRequest): boolean {
    const authHeader = request.headers.get("Authorization")
    return authHeader === `Bearer ${process.env.SIMPLE_INTERNAL_SECRET}`
}

// Helper to validate if a string is a valid AIFeature
function isValidFeature(feature: string): feature is AIFeature {
    return feature in FEATURES
}

// Get current model preference for a feature
async function getModelPreference(feature: AIFeature): Promise<{ id: ModelID; isDefault: boolean }> {
    // Get current preference
    const preferenceKey = `${MODEL_PREFERENCE_KEY_PREFIX}-${feature}`
    const preference = await db.query.temp.findFirst({
        where: and(eq(temp.key, preferenceKey), eq(temp.thoughtId, MODEL_PREFERENCES_THOUGHT_ID))
    })

    // Get model ID (from preference or default)
    const modelId = (preference?.value as ModelID) ?? FEATURES[feature].defaultModelId
    const isDefault = !preference

    return { id: modelId, isDefault }
}

// GET feature information
export async function GET(request: NextRequest, { params }: { params: Promise<{ name: string }> }): Promise<NextResponse> {
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

        const { name } = await params

        // Validate feature name
        if (!isValidFeature(name)) {
            return NextResponse.json({ error: `Invalid feature: ${name}` }, { status: 400 })
        }

        // Get model preference
        const model = await getModelPreference(name)
        const featureInfo = FEATURES[name]

        // Return in the same format as the features list endpoint
        return NextResponse.json({
            id: featureInfo.id,
            name: featureInfo.name,
            description: featureInfo.description,
            model
        })
    } catch (error) {
        const { name } = await params
        console.error(`Error retrieving feature ${name}:`, error)

        if (error instanceof Exception) {
            return createNetworkResponse({ using: error })
        }

        return NextResponse.json({ error: "Failed to retrieve feature information." }, { status: 500 })
    }
}

// Update model preference for a feature
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ name: string }> }): Promise<NextResponse> {
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

        const { name } = await params

        // Validate feature name
        if (!isValidFeature(name)) {
            return NextResponse.json({ error: `Invalid feature: ${name}` }, { status: 400 })
        }

        // Parse request body
        const body = (await request.json()) as { modelId: ModelID | null }
        const { modelId } = body
        const featureInfo = FEATURES[name]
        const preferenceKey = `${MODEL_PREFERENCE_KEY_PREFIX}-${name}`

        if (modelId === null) {
            // Clear preference if modelId is null
            await db.delete(temp).where(and(eq(temp.key, preferenceKey), eq(temp.thoughtId, MODEL_PREFERENCES_THOUGHT_ID)))

            // Return updated feature info
            return NextResponse.json({
                id: featureInfo.id,
                name: featureInfo.name,
                description: featureInfo.description,
                model: {
                    id: featureInfo.defaultModelId,
                    isDefault: true
                }
            })
        } else {
            // Validate modelId
            if (!ALLOWED_MODEL_IDS.includes(modelId)) {
                return NextResponse.json({ error: `Invalid model ID: ${modelId}` }, { status: 400 })
            }

            // Upsert preference
            await db.delete(temp).where(and(eq(temp.key, preferenceKey), eq(temp.thoughtId, MODEL_PREFERENCES_THOUGHT_ID)))

            await db.insert(temp).values({
                thoughtId: MODEL_PREFERENCES_THOUGHT_ID,
                key: preferenceKey,
                value: modelId
            })

            // Return updated feature info
            return NextResponse.json({
                id: featureInfo.id,
                name: featureInfo.name,
                description: featureInfo.description,
                model: {
                    id: modelId,
                    isDefault: false
                }
            })
        }
    } catch (error) {
        const { name } = await params
        console.error(`Error updating model preference for feature ${name}:`, error)

        if (error instanceof Exception) {
            return createNetworkResponse({ using: error })
        }

        return NextResponse.json({ error: "Failed to update model preference." }, { status: 500 })
    }
}
