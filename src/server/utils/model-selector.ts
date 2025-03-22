/**
 * AI Model Selection Utilities
 *
 * This file provides functions to retrieve the appropriate AI model
 * based on user preferences or default settings.
 */
import { and, eq } from "drizzle-orm"
import { db } from "~/server/data"
import { temp } from "~/server/data/schemas/iiinput/temp"
import type { LanguageModelV1 } from "ai"
import {
    type AIFeature,
    DEFAULT_MODEL_IDS,
    MODEL_IDS,
    MODEL_INFO,
    MODEL_PREFERENCE_KEY_PREFIX,
    MODEL_PREFERENCES_THOUGHT_ID,
    type AnthropicModelID,
    type ModelID,
    type OpenAIModelID,
    type XaiModelID
} from "~/server/config/ai/models"
import { createOpenAiModel } from "~/server/utils/ai-providers/openai"
import { createAnthropicModel } from "~/server/utils/ai-providers/anthropic"
import { createXaiModel } from "~/server/utils/ai-providers/xai"

/**
 * Get the appropriate model ID based on the feature/use case
 * Falls back to default models if no preference is set
 */
export async function getModelIdForFeature(feature: AIFeature): Promise<ModelID> {
    try {
        // Check if a preference exists
        const preferenceKey = `${MODEL_PREFERENCE_KEY_PREFIX}-${feature}`
        const preference = await db.query.temp.findFirst({
            where: and(eq(temp.key, preferenceKey), eq(temp.thoughtId, MODEL_PREFERENCES_THOUGHT_ID))
        })

        // Get the model ID from preference or fall back to default
        const modelId = preference?.value as ModelID | undefined
        return modelId ?? DEFAULT_MODEL_IDS[feature]
    } catch (error) {
        console.error(`Error getting model ID for feature ${feature}:`, error)

        // Default fallback for error cases
        return MODEL_IDS.GPT_4O_MINI
    }
}

/**
 * Get the appropriate model based on the feature/use case
 * This can be used directly in generateText() and other AI SDK functions
 */
export async function getModelForFeature(feature: AIFeature): Promise<LanguageModelV1> {
    try {
        const modelId = await getModelIdForFeature(feature)
        return getModelForId(modelId)
    } catch (error) {
        console.error(`Error getting model for feature ${feature}:`, error)

        // Default fallback for error cases
        return createOpenAiModel(MODEL_IDS.GPT_4O_MINI)
    }
}

/**
 * Get a model instance for a specific model ID
 */
export function getModelForId(modelId: ModelID): LanguageModelV1 {
    const modelInfo = MODEL_INFO[modelId]
    const providerId = modelInfo.provider.id

    switch (providerId) {
        case "anthropic":
            return createAnthropicModel(modelId as AnthropicModelID)
        case "xai":
            return createXaiModel(modelId as XaiModelID)
        case "openai":
        default:
            return createOpenAiModel(modelId as OpenAIModelID)
    }
}
