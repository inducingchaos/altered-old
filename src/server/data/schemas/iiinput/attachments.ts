/**
 *
 */

import { relations } from "drizzle-orm"
import { index, int, timestamp, varchar } from "drizzle-orm/mysql-core"
import type { CreateDataTypes } from "~/packages/sdkit/src/utils/db/schema"
import { users } from "../altered"
import { createIiinputMysqlTable } from "./helpers"
import { thoughts } from "./thoughts"

export const attachments = createIiinputMysqlTable(
    "attachments",
    {
        id: int("id").autoincrement().primaryKey(),
        userId: int("user_id").notNull(),
        thoughtId: int("thought_id").notNull(),

        url: varchar("url", { length: 2048 }).notNull().unique(),

        createdAt: timestamp("created_at").notNull().defaultNow(),
        updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow()
    },
    attachment => [index("url_idx").on(attachment.url)]
)

export const attachmentsRelations = relations(attachments, ({ one }) => ({
    user: one(users, {
        fields: [attachments.userId],
        references: [users.id]
    }),

    thought: one(thoughts, {
        fields: [attachments.thoughtId],
        references: [thoughts.id]
    })
}))

export const attachmentsDependencies = ["users", "thoughts"] as const

export const uniqueAttachmentColumns = ["id"] as const
export const attachmentIndexes = [...uniqueAttachmentColumns.map(column => [column])] as const
export const prohibitedAttachmentColumns = ["id", "createdAt", "updatedAt"] as const
export const restrictedAttachmentColumns = ["id", "userId", "createdAt", "updatedAt"] as const

export type AttachmentDataTypes = CreateDataTypes<
    typeof attachments,
    typeof uniqueAttachmentColumns,
    typeof prohibitedAttachmentColumns,
    typeof restrictedAttachmentColumns
>

export type Attachment = AttachmentDataTypes["Readable"]
export type QueryableAttachment = AttachmentDataTypes["Queryable"]
export type IdentifiableAttachment = AttachmentDataTypes["Identifiable"]

export type WritableAttachment = AttachmentDataTypes["Writable"]
export type CreatableAttachment = AttachmentDataTypes["Creatable"]
export type UpdatableAttachment = AttachmentDataTypes["Updatable"]
