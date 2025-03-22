/**
 * xAI Provider Integration
 *
 * This file provides utility functions for working with the xAI (Grok) provider
 * through the AI SDK.
 */

import { xai } from "@ai-sdk/xai"
import type { LanguageModelV1 } from "ai"
import { MODEL_IDS } from "~/server/config/ai/models"

/**
 * Create a configured instance of the xAI provider with the given model ID
 */
export function createXaiModel(modelId = MODEL_IDS.GROK_2): LanguageModelV1 {
    // Type assertion needed because our model IDs might not match the SDK's expected types exactly
    return xai(modelId)
}

/**
 * Default xAI model instance
 */
export const defaultXaiModel = createXaiModel()
