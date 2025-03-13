/**
 * Utility to generate aliases for thoughts
 */
import { openai } from "@ai-sdk/openai"
import { generateText } from "ai"
import { db } from "~/server/data"
import { temp } from "~/server/data/schemas/iiinput/temp"
import type { Thought } from "~/server/data/schemas/iiinput/thoughts"

/**
 * Generates and stores a concise alias for a thought
 * Will only generate an alias if one doesn't already exist
 *
 * rename to generateAlias cuz we check elsewhere
 */
export async function ensureThoughtAlias(thought: ThoughtWithAlias): Promise<ThoughtWithAlias> {
    try {
        // Generate a new alias
        const systemPrompt = `
You are a concise title generator. Your task is to create a short, descriptive title (2-4 words) that captures the essence of the text content provided. 
The title should be clear, relevant, and properly formatted with standard capitalization.
Respond with ONLY the title and nothing else.
`

        const result = await generateText({
            model: openai("gpt-4o-mini"),
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
