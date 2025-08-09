/**
 *
 */

import { relations } from "drizzle-orm"
// import { text, timestamp, varchar } from "drizzle-orm/mysql-core"
import { text, timestamp, varchar } from "drizzle-orm/pg-core"
import { nanoid } from "nanoid"
import type { CreateDataTypes } from "~/packages/sdkit/src/utils/db/schema"
import { users } from "../altered"
import { attachments } from "./attachments"
// import { createIiinputMysqlTable } from "./helpers"
import { createIiinputPgTable } from "./helpers"
import { thoughtsToTags } from "./joins"
import { temp } from "./temp"

// export const thoughts = createIiinputMysqlTable(
export const thoughts = createIiinputPgTable(
    "thoughts",
    {
        // MySQL: id: varchar("id", { length: 255 }).primaryKey().$defaultFn(nanoid),
        id: varchar("id").primaryKey().$defaultFn(nanoid),
        // MySQL: userId: varchar("user_id", { length: 255 }).notNull(),
        userId: varchar("user_id").notNull(),

        content: text("content").notNull(),
        // MySQL: attachmentId: varchar("attachment_id", { length: 255 }),
        attachmentId: varchar("attachment_id"),

        createdAt: timestamp("created_at").notNull().defaultNow(),
        // MySQL: updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow()
        updatedAt: timestamp("updated_at").notNull().defaultNow()
    }
    // thought => [index("content_idx").on(thought.content)]
)

export const thoughtsRelations = relations(thoughts, ({ one, many }) => ({
    user: one(users, {
        fields: [thoughts.userId],
        references: [users.id]
    }),

    tags: many(thoughtsToTags),

    tempValues: many(temp),

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
