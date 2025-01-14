/**
 *
 */

import { relations } from "drizzle-orm"
import { int, primaryKey } from "drizzle-orm/mysql-core"
import { createIiinputMysqlTable } from "../helpers"
import { tags } from "../tags"
import { thoughts } from "../thoughts"

export const thoughtsToTags = createIiinputMysqlTable(
    "thoughts_to_tags",
    {
        thoughtId: int("thought_id").notNull(),
        tagId: int("tag_id").notNull()
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
