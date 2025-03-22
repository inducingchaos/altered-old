/**
 * API route for managing AI model preferences for specific features
 */
import { and, eq } from "drizzle-orm"
import { NextResponse, type NextRequest } from "next/server"
import { Exception } from "~/packages/sdkit/src/meta"
import { createNetworkResponse } from "~/packages/sdkit/src/utils/network"
import { db } from "~/server/data"
import { temp } from "~/server/data/schemas/iiinput/temp"
import {
    DEFAULT_MODEL_IDS,
    MODEL_INFO,
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
    return feature in DEFAULT_MODEL_IDS
}

// GET current model preference for a feature
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

        // Get current preference
        const preferenceKey = `${MODEL_PREFERENCE_KEY_PREFIX}-${name}`
        const preference = await db.query.temp.findFirst({
            where: and(eq(temp.key, preferenceKey), eq(temp.thoughtId, MODEL_PREFERENCES_THOUGHT_ID))
        })

        // Get model ID (from preference or default)
        const modelId = (preference?.value as ModelID) ?? DEFAULT_MODEL_IDS[name]

        // Return model info
        return NextResponse.json({
            feature: name,
            model: MODEL_INFO[modelId],
            isDefault: !preference
        })
    } catch (error) {
        console.error(`Error getting model preference for feature ${params.name}:`, error)

        if (error instanceof Exception) {
            return createNetworkResponse({ using: error })
        }

        return NextResponse.json({ error: "Failed to get model preference." }, { status: 500 })
    }
}

// UPDATE or CLEAR model preference for a feature
export async function PATCH(request: NextRequest, { params }: { params: { name: string } }): Promise<NextResponse> {
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

        // Parse request body
        const body = (await request.json()) as { modelId: ModelID | null }
        const { modelId } = body

        const preferenceKey = `${MODEL_PREFERENCE_KEY_PREFIX}-${name}`

        if (modelId === null) {
            // Clear preference if modelId is null
            await db.delete(temp).where(and(eq(temp.key, preferenceKey), eq(temp.thoughtId, MODEL_PREFERENCES_THOUGHT_ID)))

            // Return default model info
            const defaultModelId = DEFAULT_MODEL_IDS[name]
            return NextResponse.json({
                feature: name,
                model: MODEL_INFO[defaultModelId],
                isDefault: true,
                message: `Preference cleared, using default model for ${name}`
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

            // Return updated model info
            return NextResponse.json({
                feature: name,
                model: MODEL_INFO[modelId],
                isDefault: false,
                message: `Preference updated for ${name}`
            })
        }
    } catch (error) {
        console.error(`Error setting model preference for feature ${params.name}:`, error)

        if (error instanceof Exception) {
            return createNetworkResponse({ using: error })
        }

        return NextResponse.json({ error: "Failed to set model preference." }, { status: 500 })
    }
}
