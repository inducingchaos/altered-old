/**
 *
 */

import { relations } from "drizzle-orm"
// import { primaryKey, varchar } from "drizzle-orm/mysql-core"
import { primaryKey, varchar } from "drizzle-orm/pg-core"
// import { createIiinputMysqlTable } from "../helpers"
import { createIiinputPgTable } from "../helpers"
import { tags } from "../tags"
import { thoughts } from "../thoughts"

// export const thoughtsToTags = createIiinputMysqlTable(
export const thoughtsToTags = createIiinputPgTable(
    "thoughts_to_tags",
    {
        // MySQL: thoughtId: varchar("thought_id", { length: 255 }).notNull(),
        thoughtId: varchar("thought_id").notNull(),
        // MySQL: tagId: varchar("tag_id", { length: 255 }).notNull()
        tagId: varchar("tag_id").notNull()
    },
    thoughtToTag => [primaryKey({ columns: [thoughtToTag.thoughtId, thoughtToTag.tagId] })]
)

export const thoughtsToTagsRelations = relations(thoughtsToTags, ({ one }) => ({
    thought: one(thoughts, {
        fields: [thoughtsToTags.thoughtId],
        references: [thoughts.id]
    }),
    tag: one(tags, {
        fields: [thoughtsToTags.tagId],
        references: [tags.id]
    })
}))

export const thoughtsToTagsDependencies = ["thoughts", "tags"] as const
