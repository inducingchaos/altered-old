/**
 *
 */

import { relations } from "drizzle-orm"
import { index, timestamp, varchar } from "drizzle-orm/pg-core"
import { nanoid } from "nanoid"
import type { CreateDataTypes } from "~/packages/sdkit/src/utils/db/schema"
import { users } from "../altered"
import { createIiinputPgTable } from "./helpers"
import { thoughtsToTags } from "./joins"

export const tags = createIiinputPgTable(
    "tags",
    {
        id: varchar("id").primaryKey().$defaultFn(nanoid),
        userId: varchar("user_id").notNull(),

        name: varchar("name").notNull().unique(),

        createdAt: timestamp("created_at").notNull().defaultNow(),
        updatedAt: timestamp("updated_at").notNull().defaultNow()
    },
    tag => [index("name_idx").on(tag.name)]
)

export const tagsRelations = relations(tags, ({ one, many }) => ({
    user: one(users, {
        fields: [tags.userId],
        references: [users.id]
    }),

    thoughts: many(thoughtsToTags)
}))

export const tagsDependencies = ["users"] as const

export const uniqueTagColumns = ["id"] as const
export const tagIndexes = [...uniqueTagColumns.map(column => [column])] as const
export const prohibitedTagColumns = ["id", "createdAt", "updatedAt"] as const
export const restrictedTagColumns = ["id", "userId", "name", "createdAt", "updatedAt"] as const

export type TagDataTypes = CreateDataTypes<
    typeof tags,
    typeof uniqueTagColumns,
    typeof prohibitedTagColumns,
    typeof restrictedTagColumns
>

export type Tag = TagDataTypes["Readable"]
export type QueryableTag = TagDataTypes["Queryable"]
export type IdentifiableTag = TagDataTypes["Identifiable"]

export type WritableTag = TagDataTypes["Writable"]
export type CreatableTag = TagDataTypes["Creatable"]
export type UpdatableTag = TagDataTypes["Updatable"]
