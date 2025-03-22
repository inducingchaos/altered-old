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

// Model descriptions for display and selection
export type ModelInfo = {
    id: ModelID
    provider: {
        id: AIProvider
        name: string
    }
    name: string
    description: string
    capabilities: string[]
}

export const MODEL_INFO: Record<ModelID, ModelInfo> = {
    [MODEL_IDS.GPT_4O_MINI]: {
        id: MODEL_IDS.GPT_4O_MINI,
        provider: {
            id: "openai",
            name: PROVIDER_DISPLAY_NAMES.openai
        },
        name: "GPT-4o Mini",
        description: "Fast and efficient model with strong performance at a lower cost",
        capabilities: ["text generation", "creative writing", "summarization"]
    },
    [MODEL_IDS.CLAUDE_3_7_SONNET]: {
        id: MODEL_IDS.CLAUDE_3_7_SONNET,
        provider: {
            id: "anthropic",
            name: PROVIDER_DISPLAY_NAMES.anthropic
        },
        name: "Claude 3.7 Sonnet",
        description: "Balanced model with excellent reasoning and instruction following abilities",
        capabilities: ["text generation", "reasoning", "instruction following"]
    },
    [MODEL_IDS.GROK_2]: {
        id: MODEL_IDS.GROK_2,
        provider: {
            id: "xai",
            name: PROVIDER_DISPLAY_NAMES.xai
        },
        name: "Grok 2",
        description: "Latest model from xAI with up-to-date knowledge and conversational abilities",
        capabilities: ["text generation", "real-time knowledge", "conversation"]
    }
}

// All allowed model IDs (for validation)
export const ALLOWED_MODEL_IDS = Object.values(MODEL_IDS)

// --------------------------------------------------
// Feature/Use Case Mapping
// --------------------------------------------------

// Available AI features/use cases
export type AIFeature = "thought-generation" | "alias-generation" | "spell-checking"

// Feature descriptions (for UI)
export const FEATURE_DESCRIPTIONS: Record<AIFeature, string> = {
    "thought-generation": "Creates new thoughts based on prompts",
    "alias-generation": "Generates concise aliases for thoughts",
    "spell-checking": "Corrects spelling and grammar issues"
}

// Default model IDs for each feature
export const DEFAULT_MODEL_IDS: Record<AIFeature, ModelID> = {
    "thought-generation": MODEL_IDS.GPT_4O_MINI,
    "alias-generation": MODEL_IDS.GPT_4O_MINI,
    "spell-checking": MODEL_IDS.GPT_4O_MINI
}

// --------------------------------------------------
// Preference Storage
// --------------------------------------------------

// Storage key for model preferences in temp database
export const MODEL_PREFERENCE_KEY_PREFIX = "model-preference"

// Thought ID used for storing model preferences (system preferences)
export const MODEL_PREFERENCES_THOUGHT_ID = "system-model-preferences"
