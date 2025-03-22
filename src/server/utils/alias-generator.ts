/**
 * Utility to generate aliases for thoughts
 */
import { generateText } from "ai"
import { db } from "~/server/data"
import { temp } from "~/server/data/schemas/iiinput/temp"
import { getSystemPrompt } from "~/server/utils/prompts"
import { getModelForFeature } from "~/server/utils/model-selector"
import type { Thought } from "~/server/data/schemas/iiinput/thoughts"
import { AIFeature } from "../config/ai/models"

/**
 * Generates and stores a concise alias for a thought
 * Will only generate an alias if one doesn't already exist
 *
 * rename to generateAlias cuz we check elsewhere
 */
export async function ensureThoughtAlias(thought: ThoughtWithAlias): Promise<ThoughtWithAlias> {
    try {
        // Get the system prompt for alias generation
        const systemPrompt = await getSystemPrompt("alias-generation")

        // Get the preferred model for alias generation
        const model = await getModelForFeature(AIFeature.ALIAS_GENERATION)

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
