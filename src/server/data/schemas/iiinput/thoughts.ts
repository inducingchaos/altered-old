/**
 *
 */

import { relations } from "drizzle-orm"
import { index, int, timestamp, varchar } from "drizzle-orm/mysql-core"
import { users } from "../altered"
import { attachments } from "./attachments"
import { createIiinputMysqlTable } from "./helpers"
import { thoughtsToTags } from "./joins"
import type { CreateDataTypes } from "~/packages/sdkit/src/utils/db/schema"

export const thoughts = createIiinputMysqlTable(
    "thoughts",
    {
        id: int("id").autoincrement().primaryKey(),
        userId: int("user_id").notNull(),

        content: varchar("content", { length: 255 }).notNull(),
        attachmentId: int("attachment_id"),

        createdAt: timestamp("created_at").notNull().defaultNow(),
        updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow()
    },
    thought => [index("content_idx").on(thought.content)]
)

export const thoughtsRelations = relations(thoughts, ({ one, many }) => ({
    user: one(users, {
        fields: [thoughts.userId],
        references: [users.id]
    }),

    tags: many(thoughtsToTags),

    attachment: one(attachments, {
        fields: [thoughts.attachmentId],
        references: [attachments.id]
    })
}))

export const thoughtsDependencies = ["users"] as const

export const uniqueThoughtColumns = ["id"] as const
export const thoughtIndexes = [...uniqueThoughtColumns.map(column => [column])] as const
export const prohibitedThoughtColumns = ["id", "createdAt", "updatedAt"] as const
export const restrictedThoughtColumns = ["id", "userId", "createdAt", "updatedAt"] as const

export type ThoughtDataTypes = CreateDataTypes<
    typeof thoughts,
    typeof uniqueThoughtColumns,
    typeof prohibitedThoughtColumns,
    typeof restrictedThoughtColumns
>

export type Thought = ThoughtDataTypes["Readable"]
export type QueryableThought = ThoughtDataTypes["Queryable"]
export type IdentifiableThought = ThoughtDataTypes["Identifiable"]

export type WritableThought = ThoughtDataTypes["Writable"]
export type CreatableThought = ThoughtDataTypes["Creatable"]
export type UpdatableThought = ThoughtDataTypes["Updatable"]
