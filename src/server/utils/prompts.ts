/**
 * Utility for managing system prompts
 */
import { eq } from "drizzle-orm"
import { db } from "~/server/data"
import { prompts, type PromptWithMeta } from "~/server/data/schemas/iiinput/prompts"
import { DEFAULT_PROMPTS, PROMPT_IDS } from "./prompt-definitions"

// Re-export PROMPT_IDS for convenience
export { PROMPT_IDS } from "./prompt-definitions"

// Variable template regex - matches {{ variableName }} with optional spaces
const VARIABLE_REGEX = /\{\{\s*([a-zA-Z0-9_-]+)\s*\}\}/g

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
        const defaultPrompt = DEFAULT_PROMPTS[promptId]

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

        throw error
    }
}

/**
 * Gets a system prompt and information about its template variables
 */
export async function getPromptWithMeta(promptId: string): Promise<{
    content: string
    name: string
    allowedVariables: string[]
}> {
    try {
        // Get the raw prompt content
        const promptContent = await getSystemPrompt(promptId)

        // Get the prompt definition from default prompts
        const defaultDef = DEFAULT_PROMPTS[promptId]
        if (!defaultDef) {
            throw new Error(`No default definition found for prompt: ${promptId}`)
        }

        // Get the allowed variables from the default definition
        const allowedVariables = Object.keys(defaultDef.variables)

        // Get the name (either from DB or default)
        const existingPrompt = await db.query.prompts.findFirst({
            where: eq(prompts.promptId, promptId)
        })

        const name = existingPrompt?.name ?? defaultDef.name

        return {
            content: promptContent,
            name,
            allowedVariables
        }
    } catch (error) {
        console.error(`Error getting prompt with meta: ${promptId}`, error)
        throw error
    }
}

/**
 * Extract variables from a prompt template
 */
export function extractVariables(content: string): string[] {
    const variables: string[] = []
    let match: RegExpExecArray | null

    // Reset the regex to ensure we get all matches
    VARIABLE_REGEX.lastIndex = 0

    while ((match = VARIABLE_REGEX.exec(content)) !== null) {
        if (match[1] && !variables.includes(match[1])) {
            // Remove extra spaces
            const variableName = match[1].trim()
            variables.push(variableName)
        }
    }

    return variables
}

/**
 * Validates a prompt template using a sequential parser
 */
export function validatePromptTemplate(
    content: string,
    promptId: string
): {
    isValid: boolean
    errors: string[]
} {
    const errors: string[] = []

    // Sequential parsing of the template
    let position = 0
    let inVariable = false
    let currentVariable = ""
    const extractedVars: string[] = []

    while (position < content.length) {
        // Find the next opening/closing bracket
        const openingIdx = content.indexOf("{{", position)
        const closingIdx = content.indexOf("}}", position)

        if (inVariable) {
            // We're inside a variable, expecting a closing bracket
            if (closingIdx === -1) {
                // No closing bracket found
                errors.push(`Unclosed variable starting at position ${position}`)
                break
            }

            if (openingIdx !== -1 && openingIdx < closingIdx) {
                // Found another opening bracket before closing
                errors.push(`Nested opening bracket at position ${openingIdx} inside a variable`)
                position = openingIdx + 2
                continue
            }

            // Extract the variable name
            currentVariable = content.substring(position, closingIdx).trim()

            // Validate the variable name
            if (!currentVariable) {
                errors.push(`Empty variable name at position ${position}`)
            } else if (!/^[a-zA-Z0-9_-]+$/.test(currentVariable)) {
                errors.push(
                    `Invalid variable name "${currentVariable}" at position ${position}. Only alphanumeric, underscore, and hyphen characters are allowed.`
                )
            } else {
                extractedVars.push(currentVariable)
            }

            // Move past the closing bracket
            position = closingIdx + 2
            inVariable = false
            currentVariable = ""
        } else {
            // We're outside a variable
            if (openingIdx === -1) {
                // No more variables
                break
            }

            // Move to the opening bracket and mark as inside a variable
            position = openingIdx + 2
            inVariable = true
        }
    }

    // Check if we ended inside a variable
    if (inVariable) {
        errors.push("Unclosed variable at the end of the template")
    }

    // Validate variables against allowed variables
    const defaultDef = DEFAULT_PROMPTS[promptId]

    if (defaultDef) {
        const allowedVariables = Object.keys(defaultDef.variables)

        const invalidVars = extractedVars.filter(v => !allowedVariables.includes(v))
        if (invalidVars.length > 0) {
            errors.push(
                `Invalid variables for this prompt: ${invalidVars.join(", ")}. Allowed variables: ${allowedVariables.join(", ")}`
            )
        }
    } else {
        errors.push(`Could not find prompt definition for ID: ${promptId}`)
    }

    return {
        isValid: errors.length === 0,
        errors
    }
}

/**
 * Process a prompt template by replacing variables with their resolved values
 */
async function processTemplate(template: string, promptId: string): Promise<string> {
    // Get the prompt definition
    const promptDef = DEFAULT_PROMPTS[promptId]
    if (!promptDef) {
        throw new Error(`No default definition found for prompt: ${promptId}`)
    }

    // Extract the variables from the template
    const extractedVars = extractVariables(template)

    // Create a map to store the resolved values
    const resolvedValues: Record<string, string> = {}

    // Resolve each variable
    for (const varName of extractedVars) {
        const resolver = promptDef.variables[varName]
        if (resolver) {
            const value = await resolver()
            resolvedValues[varName] = Array.isArray(value) ? value.join("\n") : value
        }
    }

    // Replace the variables in the template
    return template.replace(VARIABLE_REGEX, (match, variableName: string) => {
        const varName = variableName.trim()
        return resolvedValues[varName] ?? match
    })
}

/**
 * Gets a computed prompt with all variables resolved
 */
export async function resolvePrompt(promptId: string): Promise<string> {
    try {
        // Get the raw prompt content
        const promptContent = await getSystemPrompt(promptId)

        // Process the template
        const processedPrompt = await processTemplate(promptContent, promptId)

        return processedPrompt
    } catch (error) {
        console.error(`Error resolving prompt: ${promptId}`, error)
        throw error
    }
}

/**
 * Updates a system prompt
 */
export async function updateSystemPrompt(
    promptId: string,
    content: string,
    name?: string
): Promise<{
    content: string
    name: string
    allowedVariables: string[]
}> {
    try {
        // Validate the template against the allowed variables
        const validation = validatePromptTemplate(content, promptId)
        if (!validation.isValid) {
            throw new Error(`Invalid prompt template: ${validation.errors.join("; ")}`)
        }

        // Format the template for better readability
        const formattedContent = formatTemplate(content)

        const existingPrompt = await db.query.prompts.findFirst({
            where: eq(prompts.promptId, promptId)
        })

        // Get the default definition
        const defaultDef = DEFAULT_PROMPTS[promptId]
        if (!defaultDef) {
            throw new Error(`No default definition found for prompt: ${promptId}`)
        }

        if (existingPrompt) {
            // Update existing prompt
            await db
                .update(prompts)
                .set({
                    content: formattedContent,
                    ...(name ? { name } : {})
                })
                .where(eq(prompts.promptId, promptId))

            return {
                content: formattedContent,
                name: name ?? existingPrompt.name,
                allowedVariables: Object.keys(defaultDef.variables ?? {})
            }
        } else {
            // Create new prompt (upsert pattern)
            const newName = name ?? defaultDef.name

            // Create the new prompt
            await db.insert(prompts).values({
                promptId,
                name: newName,
                content: formattedContent
            })

            return {
                content: formattedContent,
                name: newName,
                allowedVariables: Object.keys(defaultDef.variables)
            }
        }
    } catch (error) {
        console.error(`Error updating system prompt ${promptId}:`, error)
        throw error
    }
}

/**
 * Format a template for better readability (standardizing spacing in variables)
 */
export function formatTemplate(template: string): string {
    return template.replace(VARIABLE_REGEX, (match, variableName: string) => {
        return `{{ ${variableName.trim()} }}`
    })
}

/**
 * Gets allowed variables for a specific prompt
 */
export function getAllowedVariablesForPrompt(promptId: string): string[] {
    const defaultDef = DEFAULT_PROMPTS[promptId]
    if (defaultDef) {
        return Object.keys(defaultDef.variables)
    }
    return []
}

/**
 * Retrieves all system prompts with their metadata
 */
export async function getAllSystemPromptsWithMeta(): Promise<PromptWithMeta[]> {
    try {
        // Get all prompts from database
        const existingPrompts = await db.select().from(prompts)
        const existingPromptIds = new Set(existingPrompts.map(p => p.promptId))

        // Find default prompts that are not in the database yet
        const missingPromptIds = PROMPT_IDS.filter(id => !existingPromptIds.has(id))

        // Insert missing default prompts into the database
        if (missingPromptIds.length > 0) {
            const missingPrompts = await Promise.all(
                missingPromptIds.map(async id => {
                    const defaultDef = DEFAULT_PROMPTS[id]
                    if (!defaultDef) return null

                    // Insert the default prompt into the database
                    await db.insert(prompts).values({
                        promptId: id,
                        content: defaultDef.content,
                        name: defaultDef.name || id
                    })

                    // Return the newly inserted prompt
                    return {
                        promptId: id,
                        content: defaultDef.content,
                        name: defaultDef.name || id
                    }
                })
            )

            // Add the newly inserted prompts to the existing ones
            existingPrompts.push(...(missingPrompts.filter(Boolean) as typeof existingPrompts))
        }

        // Transform all prompts with their metadata
        const promptsWithMeta = existingPrompts.map(prompt => {
            const allowedVariables = getAllowedVariablesForPrompt(prompt.promptId)
            return {
                id: prompt.promptId,
                content: prompt.content,
                name: prompt.name || prompt.promptId,
                allowedVariables
            }
        })

        return promptsWithMeta
    } catch (error) {
        console.error("Error fetching all system prompts:", error)
        throw new Error("Failed to fetch system prompts")
    }
}

/**
 * Preview a prompt with its variables resolved (for debugging)
 */
export async function previewPrompt(promptId: string): Promise<{
    raw: string
    processed: string
    allowedVariables: string[]
}> {
    try {
        // Get the prompt content
        const promptContent = await getSystemPrompt(promptId)

        // Process the template
        const processedPrompt = await resolvePrompt(promptId)

        // Get the default definition
        const defaultDef = DEFAULT_PROMPTS[promptId]
        if (!defaultDef) {
            throw new Error(`No default definition found for prompt: ${promptId}`)
        }

        return {
            raw: promptContent,
            processed: processedPrompt,
            allowedVariables: Object.keys(defaultDef.variables)
        }
    } catch (error) {
        console.error(`Error previewing prompt: ${promptId}`, error)
        throw error
    }
}
