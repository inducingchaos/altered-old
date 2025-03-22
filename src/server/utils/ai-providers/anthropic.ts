/**
 * Anthropic Provider Integration
 *
 * This file provides utility functions for working with the Anthropic provider
 * through the AI SDK.
 */

import { anthropic } from "@ai-sdk/anthropic"
import type { LanguageModelV1 } from "ai"
import { MODEL_IDS } from "~/server/config/ai/models"

/**
 * Create a configured instance of the Anthropic provider with the given model ID
 */
export function createAnthropicModel(modelId = MODEL_IDS.CLAUDE_3_7_SONNET): LanguageModelV1 {
    // Type assertion needed because our model IDs might not match the SDK's expected types exactly
    return anthropic(modelId)
}

/**
 * Default Anthropic model instance
 */
export const defaultAnthropicModel = createAnthropicModel()
