/**
 * System prompts storage
 */

import { text, timestamp, varchar } from "drizzle-orm/mysql-core"
import { nanoid } from "nanoid"
import type { CreateDataTypes } from "~/packages/sdkit/src/utils/db/schema"
import { createIiinputMysqlTable } from "./helpers"

export const prompts = createIiinputMysqlTable("prompts", {
    id: varchar("id", { length: 255 }).primaryKey().$defaultFn(nanoid),
    promptId: varchar("prompt_id", { length: 255 }).notNull().unique(),
    name: varchar("name", { length: 255 }).notNull(),
    content: text("content").notNull(),

    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow()
})

export const uniquePromptsColumns = ["id", "promptId"] as const
export const prohibitedPromptsColumns = ["id", "createdAt", "updatedAt"] as const
export const restrictedPromptsColumns = ["id", "createdAt", "updatedAt"] as const

export type PromptsDataTypes = CreateDataTypes<
    typeof prompts,
    typeof uniquePromptsColumns,
    typeof prohibitedPromptsColumns,
    typeof restrictedPromptsColumns
>

export type Prompt = PromptsDataTypes["Readable"]
export type QueryablePrompt = PromptsDataTypes["Queryable"]
export type IdentifiablePrompt = PromptsDataTypes["Identifiable"]

export type WritablePrompt = PromptsDataTypes["Writable"]
export type CreatablePrompt = PromptsDataTypes["Creatable"]
export type UpdatablePrompt = PromptsDataTypes["Updatable"]

// Default system prompts
export const DEFAULT_PROMPTS = {
    "alias-generation": {
        name: "Alias Generation",
        content: `You are a concise title generator. Your task is to create a short, descriptive title (2-4 words) that captures the essence of the text content provided. 
The title should be clear, relevant, and properly formatted with standard capitalization.
Respond with ONLY the title and nothing else.`
    }
}
