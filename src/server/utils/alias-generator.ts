/**
 * Utility to generate aliases for thoughts
 */
import { generateText } from "ai"
import { and, eq } from "drizzle-orm"
import { db } from "~/server/data"
import { temp } from "~/server/data/schemas/iiinput/temp"
import { getSystemPrompt } from "~/server/utils/prompts"
import { getModelForFeature } from "~/server/utils/model-selector"
import { SYSTEM_PREFERENCES_THOUGHT_ID, SYSTEM_PREFERENCE_KEYS } from "~/server/config/preferences"
import type { Thought } from "~/server/data/schemas/iiinput/thoughts"

/**
 * Checks if automatic alias generation is enabled
 * Returns true by default if the preference doesn't exist
 */
export async function isAliasGenerationEnabled(): Promise<boolean> {
    try {
        const preference = await db.query.temp.findFirst({
            where: and(
                eq(temp.thoughtId, SYSTEM_PREFERENCES_THOUGHT_ID),
                eq(temp.key, SYSTEM_PREFERENCE_KEYS.AUTO_GENERATE_ALIASES)
            )
        })

        // If preference doesn't exist, default to true
        if (!preference) {
            return true
        }

        // Parse the preference value as a bool from string, default to false if not right
        return preference.value === "true"
    } catch (error) {
        console.error("Error checking alias generation preference:", error)
        return true // Default to enabled if there's an error
    }
}

/**
 * Generates and stores a concise alias for a thought
 * Will only generate an alias if one doesn't already exist
 * and if automatic alias generation is enabled
 */
export async function ensureThoughtAlias(thought: ThoughtWithAlias): Promise<ThoughtWithAlias> {
    try {
        // Check if alias generation is enabled
        const isEnabled = await isAliasGenerationEnabled()
        if (!isEnabled) {
            return thought
        }

        // Get the system prompt for alias generation
        const systemPrompt = await getSystemPrompt("alias-generation")

        // Get the preferred model for alias generation
        const model = await getModelForFeature("alias-generation")

        // Generate the alias
        const result = await generateText({
            model,
            system: systemPrompt,
            prompt: thought.content,
            maxTokens: 20
        })

        // Convert the result to a usable string
        const alias = result.text

        // Store the alias in the temp table
        await db.insert(temp).values({
            thoughtId: thought.id,
            key: "alias",
            value: alias
        })

        return {
            ...thought,
            alias
        }
    } catch (error) {
        console.error("Error generating alias for thought:", error)
        return thought
    }
}

/**
 * Batch processes thoughts to ensure they all have aliases
 */
export async function ensureThoughtsAliases(thoughts: ThoughtWithAlias[]): Promise<ThoughtWithAlias[]> {
    return await Promise.all(thoughts.map(thought => ensureThoughtAlias(thought)))
}

type ThoughtWithAlias = Thought & { alias?: string }
