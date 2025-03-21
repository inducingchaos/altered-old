/**
 * Prompt definitions and variable resolvers
 */
import { db } from "~/server/data"
import { thoughts as thoughtsSchema } from "~/server/data/schemas/iiinput/thoughts"
import type { PromptDefinition } from "~/server/data/schemas/iiinput/prompts"

// Fetch all thoughts for the allThoughts variable
export async function getAllThoughts(): Promise<string[]> {
    try {
        // Fetch thoughts from the database in chronological order
        const thoughts = await db
            .select({ content: thoughtsSchema.content })
            .from(thoughtsSchema)
            .orderBy(thoughtsSchema.createdAt)
            .limit(100) // Limit to prevent overwhelming the context window

        // Extract just the content field
        return thoughts.map(thought => thought.content)
    } catch (error) {
        console.error("Error fetching thoughts for prompt:", error)
        return ["Error fetching thoughts"]
    }
}

// Default system prompts with their allowed variables and resolver functions
export const DEFAULT_PROMPTS: Record<string, PromptDefinition> = {
    "alias-generation": {
        name: "Alias Generation",
        content: `You are a concise title generator. Your task is to create a short, descriptive title (2-4 words) that captures the essence of the text content provided. 
The title should be clear, relevant, and properly formatted with standard capitalization.
Respond with ONLY the title and nothing else.`,
        variables: {}
    },
    "thought-generation": {
        name: "Thought Generation",
        content: `You are responding as if you are an extension of the digital brain represented by the following thoughts.
Use "I" instead of "you" or "we" - respond as if you ARE the digital brain.
Use these thoughts as your knowledge base, but you're not limited to just this information.
Respond in the same persona/character as these thoughts if applicable.

Here are the thoughts in chronological order:
{{ allThoughts }}`,
        variables: {
            allThoughts: getAllThoughts
        }
    }
}

// Export a list of all prompt IDs
export const PROMPT_IDS = Object.keys(DEFAULT_PROMPTS)
