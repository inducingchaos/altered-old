/**
 * AI Models Configuration
 *
 * This file serves as the central configuration for all AI models and their use cases.
 * Add new models, providers, and use cases here to make them available throughout the application.
 */

// --------------------------------------------------
// Provider Definitions
// --------------------------------------------------

// Supported AI providers
export type AIProvider = "openai" | "anthropic" | "xai"

// Provider display names (for UI)
export const PROVIDER_DISPLAY_NAMES: Record<AIProvider, string> = {
    openai: "OpenAI",
    anthropic: "Anthropic",
    xai: "xAI"
}

// --------------------------------------------------
// Model Definitions
// --------------------------------------------------

// Available model IDs
export const MODEL_IDS = {
    // OpenAI models
    GPT_4O_MINI: "gpt-4o-mini",

    // Anthropic models
    CLAUDE_3_7_SONNET: "claude-3-7-sonnet",

    // xAI (Grok) models
    GROK_2: "grok-2"
} as const

// Type for model IDs
export type ModelID = (typeof MODEL_IDS)[keyof typeof MODEL_IDS]

export type OpenAIModelID = typeof MODEL_IDS.GPT_4O_MINI
export type AnthropicModelID = typeof MODEL_IDS.CLAUDE_3_7_SONNET
export type XaiModelID = typeof MODEL_IDS.GROK_2

// Model provider mapping
export const MODEL_PROVIDERS: Record<ModelID, AIProvider> = {
    [MODEL_IDS.GPT_4O_MINI]: "openai",
    [MODEL_IDS.CLAUDE_3_7_SONNET]: "anthropic",
    [MODEL_IDS.GROK_2]: "xai"
}

// Model display names (for UI)
export const MODEL_DISPLAY_NAMES: Record<ModelID, string> = {
    [MODEL_IDS.GPT_4O_MINI]: "GPT-4o mini",
    [MODEL_IDS.CLAUDE_3_7_SONNET]: "Claude 3.7 Sonnet",
    [MODEL_IDS.GROK_2]: "Grok 2"
}

// All allowed model IDs
export const ALLOWED_MODEL_IDS = Object.values(MODEL_IDS)

// --------------------------------------------------
// Use Case Definitions
// --------------------------------------------------

// Feature/use case types
export enum AIFeature {
    ALIAS_GENERATION = "alias-generation",
    THOUGHT_GENERATION = "thought-generation",
    SPELLING_CORRECTION = "spelling-correction"
}

// Feature display names (for UI)
export const FEATURE_DISPLAY_NAMES: Record<AIFeature, string> = {
    [AIFeature.ALIAS_GENERATION]: "Alias Generation",
    [AIFeature.THOUGHT_GENERATION]: "Thought Generation",
    [AIFeature.SPELLING_CORRECTION]: "Spelling Correction"
}

// Feature descriptions (for UI)
export const FEATURE_DESCRIPTIONS: Record<AIFeature, string> = {
    [AIFeature.ALIAS_GENERATION]: "Generates concise aliases for thoughts",
    [AIFeature.THOUGHT_GENERATION]: "Creates new thoughts based on prompts",
    [AIFeature.SPELLING_CORRECTION]: "Corrects spelling and grammar issues"
}

// Default model ID for each feature
export const DEFAULT_MODEL_IDS: Record<AIFeature, ModelID> = {
    [AIFeature.ALIAS_GENERATION]: MODEL_IDS.CLAUDE_3_7_SONNET,
    [AIFeature.THOUGHT_GENERATION]: MODEL_IDS.GPT_4O_MINI,
    [AIFeature.SPELLING_CORRECTION]: MODEL_IDS.GPT_4O_MINI
}

// Storage key for model preferences in temp database
export const MODEL_PREFERENCE_KEY_PREFIX = "model-preference"

// Use a consistent thought ID for model preferences in temp database
export const MODEL_PREFERENCES_THOUGHT_ID = "n-a"
