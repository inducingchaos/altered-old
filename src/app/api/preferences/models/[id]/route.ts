/**
 * API routes for AI model preferences
 *
 * This API allows getting and setting AI model preferences for different features.
 */
import { eq, and } from "drizzle-orm"
import { NextResponse, type NextRequest } from "next/server"
import { Exception, type NetworkExceptionID } from "~/packages/sdkit/src/meta"
import { createNetworkResponse } from "~/packages/sdkit/src/utils/network"
import { db } from "~/server/data"
import { temp } from "~/server/data/schemas/iiinput/temp"
import {
    AIFeature,
    ALLOWED_MODEL_IDS,
    DEFAULT_MODEL_IDS,
    FEATURE_DESCRIPTIONS,
    MODEL_PREFERENCE_KEY_PREFIX,
    MODEL_PREFERENCES_THOUGHT_ID,
    type ModelID
} from "~/server/config/ai/models"

function isAuthedSimple(request: NextRequest): boolean {
    const authHeader = request.headers.get("Authorization")
    return authHeader === `Bearer ${process.env.SIMPLE_INTERNAL_SECRET}`
}

/**
 * Verify if a feature ID is valid (exists in AIFeature enum)
 */
function isValidFeature(featureId: string): featureId is AIFeature {
    return Object.values(AIFeature).includes(featureId as AIFeature)
}

/**
 * Verify if a model ID is valid
 */
function isValidModelId(modelId: string): modelId is ModelID {
    return ALLOWED_MODEL_IDS.includes(modelId as ModelID)
}

/**
 * GET /api/preferences/models/:featureId
 *
 * Retrieves the current model preference for a feature
 */
export async function GET(request: NextRequest, { params }: { params: { id: string } }): Promise<NextResponse> {
    try {
        if (!isAuthedSimple(request)) {
            return createNetworkResponse({
                using: {
                    status: "UNAUTHORIZED",
                    message: "Failed To Run Command: Invalid authorization header."
                }
            })
        }

        const featureId = params.id

        if (!isValidFeature(featureId)) {
            return NextResponse.json(
                {
                    error: `Invalid feature ID. Supported features: ${Object.values(AIFeature).join(", ")}`,
                    success: false
                },
                { status: 400 }
            )
        }

        // Check if this feature has a preference stored
        const preferenceKey = `${MODEL_PREFERENCE_KEY_PREFIX}-${featureId}`
        const preference = await db.query.temp.findFirst({
            where: and(eq(temp.key, preferenceKey), eq(temp.thoughtId, MODEL_PREFERENCES_THOUGHT_ID))
        })

        // Return the stored preference or the default
        const modelId = (preference?.value as ModelID) || DEFAULT_MODEL_IDS[featureId]

        return NextResponse.json({
            modelId,
            feature: featureId,
            description: FEATURE_DESCRIPTIONS[featureId],
            success: true
        })
    } catch (error) {
        console.error(`Error fetching model preference for ${params.id}:`, error)

        if (error instanceof Exception) {
            return createNetworkResponse({
                from: { exception: error as unknown as Exception<"network", NetworkExceptionID> }
            })
        }

        return NextResponse.json(
            {
                error: "Failed to fetch model preference.",
                success: false
            },
            { status: 500 }
        )
    }
}

/**
 * PATCH /api/preferences/models/:featureId
 *
 * Updates the model preference for a feature
 */
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }): Promise<NextResponse> {
    try {
        if (!isAuthedSimple(request)) {
            return createNetworkResponse({
                using: {
                    status: "UNAUTHORIZED",
                    message: "Failed To Run Command: Invalid authorization header."
                }
            })
        }

        const featureId = params.id

        if (!isValidFeature(featureId)) {
            return NextResponse.json(
                {
                    error: `Invalid feature ID. Supported features: ${Object.values(AIFeature).join(", ")}`,
                    success: false
                },
                { status: 400 }
            )
        }

        // Parse the request body
        const body = (await request.json()) as { modelId?: string }
        const { modelId: rawModelId } = body

        if (!rawModelId) {
            return NextResponse.json(
                {
                    error: "Model ID is required",
                    success: false
                },
                { status: 400 }
            )
        }

        if (!isValidModelId(rawModelId)) {
            return NextResponse.json(
                {
                    error: `Invalid model ID. Allowed values: ${ALLOWED_MODEL_IDS.join(", ")}`,
                    success: false
                },
                { status: 400 }
            )
        }

        // Now typechecking ensures this is a valid ModelID
        const modelId = rawModelId

        const preferenceKey = `${MODEL_PREFERENCE_KEY_PREFIX}-${featureId}`

        // Check if preference already exists
        const existingPreference = await db.query.temp.findFirst({
            where: and(eq(temp.key, preferenceKey), eq(temp.thoughtId, MODEL_PREFERENCES_THOUGHT_ID))
        })

        if (existingPreference) {
            // Update existing preference
            await db
                .update(temp)
                .set({ value: modelId })
                .where(and(eq(temp.key, preferenceKey), eq(temp.thoughtId, MODEL_PREFERENCES_THOUGHT_ID)))
        } else {
            // Create new preference
            await db.insert(temp).values({
                thoughtId: MODEL_PREFERENCES_THOUGHT_ID,
                key: preferenceKey,
                value: modelId
            })
        }

        return NextResponse.json({
            modelId,
            feature: featureId,
            description: FEATURE_DESCRIPTIONS[featureId],
            success: true
        })
    } catch (error) {
        console.error(`Error updating model preference for ${params.id}:`, error)

        if (error instanceof Exception) {
            return createNetworkResponse({
                from: { exception: error as unknown as Exception<"network", NetworkExceptionID> }
            })
        }

        return NextResponse.json(
            {
                error: "Failed to update model preference.",
                success: false
            },
            { status: 500 }
        )
    }
}
