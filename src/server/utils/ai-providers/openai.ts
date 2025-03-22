/**
 * OpenAI Provider Integration
 *
 * This file provides utility functions for working with the OpenAI provider
 * through the AI SDK.
 */

import { openai } from "@ai-sdk/openai"
import type { LanguageModelV1 } from "ai"
import { MODEL_IDS } from "~/server/config/ai/models"

/**
 * Create a configured instance of the OpenAI provider with the given model ID
 */
export function createOpenAiModel(modelId = MODEL_IDS.GPT_4O_MINI): LanguageModelV1 {
    // Type assertion needed because our model IDs might not match the SDK's expected types exactly
    return openai(modelId)
}

/**
 * Default OpenAI model instance
 */
export const defaultOpenAiModel = createOpenAiModel()
