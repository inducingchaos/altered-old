/**
 * Utilities for managing thought aliases and temporary values
 *
 * For API clients: All temp values must be prefixed with "TEMP_" in API requests
 * e.g. { "TEMP_alias": "My Alias" }
 *
 * Special temp fields:
 * - "TEMP_alias": string - A short title for the thought
 * - "TEMP_validated": boolean - Whether the thought has been validated
 * - "TEMP_priority": string - Priority level for the thought
 * - "TEMP_dev-notes": string - Developer notes for the thought
 *
 * Internally these are stored without the prefix in the temp table
 */
import { and, eq } from "drizzle-orm"
import { db } from "~/server/data"
import { temp } from "~/server/data/schemas/iiinput/temp"
import type { Thought } from "~/server/data/schemas/iiinput/thoughts"

export type ThoughtWithAlias = Thought & { alias?: string; "dev-notes"?: string }

/**
 * Updates the alias for a thought, creating a new one if it doesn't exist
 */
export async function updateAlias(thoughtId: string, alias: string): Promise<void> {
    try {
        // Check if an alias already exists for this thought
        const existingAlias = await db
            .select()
            .from(temp)
            .where(and(eq(temp.thoughtId, thoughtId), eq(temp.key, "alias")))

        if (existingAlias && existingAlias.length > 0) {
            // Update existing alias
            await db
                .update(temp)
                .set({ value: alias })
                .where(and(eq(temp.thoughtId, thoughtId), eq(temp.key, "alias")))
        } else {
            // Create new alias
            await db.insert(temp).values({
                thoughtId,
                key: "alias",
                value: alias
            })
        }
    } catch (error) {
        console.error("Error updating alias:", error)
        throw new Error("Failed to update alias")
    }
}

/**
 * Updates the dev notes for a thought, creating a new entry if it doesn't exist
 */
export async function updateDevNotes(thoughtId: string, notes: string): Promise<void> {
    try {
        // Check if dev notes already exists for this thought
        const existingNotes = await db
            .select()
            .from(temp)
            .where(and(eq(temp.thoughtId, thoughtId), eq(temp.key, "dev-notes")))

        if (existingNotes && existingNotes.length > 0) {
            // Update existing notes
            await db
                .update(temp)
                .set({ value: notes })
                .where(and(eq(temp.thoughtId, thoughtId), eq(temp.key, "dev-notes")))
        } else {
            // Create new notes
            await db.insert(temp).values({
                thoughtId,
                key: "dev-notes",
                value: notes
            })
        }
    } catch (error) {
        console.error("Error updating dev notes:", error)
        throw new Error("Failed to update dev notes")
    }
}

/**
 * Fetches the alias for a thought if it exists
 */
export async function getAlias(thoughtId: string): Promise<string | undefined> {
    try {
        const result = await db
            .select()
            .from(temp)
            .where(and(eq(temp.thoughtId, thoughtId), eq(temp.key, "alias")))

        if (result && result.length > 0 && result[0]?.value) {
            return result[0].value
        }
        return undefined
    } catch (error) {
        console.error("Error fetching alias:", error)
        return undefined
    }
}

/**
 * Fetches the dev notes for a thought if they exist
 */
export async function getDevNotes(thoughtId: string): Promise<string | undefined> {
    try {
        const result = await db
            .select()
            .from(temp)
            .where(and(eq(temp.thoughtId, thoughtId), eq(temp.key, "dev-notes")))

        if (result && result.length > 0 && result[0]?.value) {
            return result[0].value
        }
        return undefined
    } catch (error) {
        console.error("Error fetching dev notes:", error)
        return undefined
    }
}

/**
 * Store any temp value for a thought
 * Note: This stores values WITHOUT the "TEMP_" prefix
 * API clients must use the prefix, but internally we store without it
 */
export async function setTempValue(thoughtId: string, key: string, value: string): Promise<void> {
    try {
        // Check if the value already exists
        const existingValue = await db
            .select()
            .from(temp)
            .where(and(eq(temp.thoughtId, thoughtId), eq(temp.key, key)))

        if (existingValue && existingValue.length > 0) {
            // Update existing value
            await db
                .update(temp)
                .set({ value })
                .where(and(eq(temp.thoughtId, thoughtId), eq(temp.key, key)))
        } else {
            // Create new value
            await db.insert(temp).values({
                thoughtId,
                key,
                value
            })
        }
    } catch (error) {
        console.error(`Error setting temp value ${key}:`, error)
        throw new Error(`Failed to set temp value ${key}`)
    }
}
