/**
 * Utility for managing system prompts
 */
import { eq } from "drizzle-orm"
import { db } from "~/server/data"
import { prompts, DEFAULT_PROMPTS } from "~/server/data/schemas/iiinput/prompts"
import type { Prompt } from "~/server/data/schemas/iiinput/prompts"

export const PROMPT_IDS = {
    ALIAS_GENERATION: "alias-generation"
} as const

/**
 * Gets a system prompt by ID
 * Creates the prompt with default content if it doesn't exist
 */
export async function getSystemPrompt(promptId: string): Promise<string> {
    try {
        // Check if the prompt exists in the database
        const existingPrompt = await db.query.prompts.findFirst({
            where: eq(prompts.promptId, promptId)
        })

        if (existingPrompt) {
            return existingPrompt.content
        }

        // If prompt doesn't exist, check if there's a default
        const defaultPrompt = DEFAULT_PROMPTS[promptId as keyof typeof DEFAULT_PROMPTS]

        if (!defaultPrompt) {
            throw new Error(`No default prompt found for ID: ${promptId}`)
        }

        // Create the prompt with default content
        await db.insert(prompts).values({
            promptId,
            name: defaultPrompt.name,
            content: defaultPrompt.content
        })

        return defaultPrompt.content
    } catch (error) {
        console.error(`Error getting system prompt ${promptId}:`, error)

        // Fallback to default if available
        const fallback = DEFAULT_PROMPTS[promptId as keyof typeof DEFAULT_PROMPTS]
        if (fallback) {
            return fallback.content
        }

        throw error
    }
}

/**
 * Updates a system prompt
 */
export async function updateSystemPrompt(promptId: string, content: string, name?: string): Promise<Prompt> {
    try {
        const existingPrompt = await db.query.prompts.findFirst({
            where: eq(prompts.promptId, promptId)
        })

        if (existingPrompt) {
            // Update existing prompt
            await db
                .update(prompts)
                .set({
                    content,
                    ...(name ? { name } : {})
                })
                .where(eq(prompts.promptId, promptId))

            return {
                ...existingPrompt,
                content,
                ...(name ? { name } : {})
            }
        } else {
            // Create new prompt
            const defaultName = DEFAULT_PROMPTS[promptId as keyof typeof DEFAULT_PROMPTS]?.name ?? promptId

            // Create the new prompt
            const newPromptData = {
                promptId,
                name: name ?? defaultName,
                content
            }

            await db.insert(prompts).values(newPromptData)

            // Fetch the newly created prompt
            const newPrompt = await db.query.prompts.findFirst({
                where: eq(prompts.promptId, promptId)
            })

            if (!newPrompt) {
                throw new Error(`Failed to create prompt: ${promptId}`)
            }

            return newPrompt
        }
    } catch (error) {
        console.error(`Error updating system prompt ${promptId}:`, error)
        throw error
    }
}

/**
 * Gets all system prompts
 */
export async function getAllSystemPrompts(): Promise<Prompt[]> {
    try {
        const allPrompts = await db.query.prompts.findMany()
        return allPrompts
    } catch (error) {
        console.error("Error getting all system prompts:", error)
        throw error
    }
}
