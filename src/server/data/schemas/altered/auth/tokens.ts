/**
 *
 */

import type { CreateDataTypes } from "@sdkit/utils/db/schema"
import { relations } from "drizzle-orm"
import { timestamp, uniqueIndex, varchar } from "drizzle-orm/mysql-core"
import { nanoid } from "nanoid"
import { users } from "."
import { createAlteredMysqlTable } from "../helpers"

export const tokenTypes = ["password-reset", "email-verification", "magic-link", "session", "push-notification"] as const

export const tokens = createAlteredMysqlTable(
    "tokens",
    {
        id: varchar("id", { length: 255 }).primaryKey().$defaultFn(nanoid),
        userId: varchar("user_id", { length: 255 }).notNull(),

        type: varchar("type", { length: 255, enum: tokenTypes }).notNull(),
        value: varchar("value", { length: 768 }).notNull(),

        expiresAt: timestamp("expires_at").notNull()
    },
    token => [uniqueIndex("userId_type_value_idx").on(token.userId, token.type, token.value)]
)

export const tokensRelations = relations(tokens, ({ one }) => ({
    user: one(users, { fields: [tokens.userId], references: [users.id] })
}))

export const tokensDependencies = ["users"] as const

export const uniqueTokenColumns = ["id"] as const
export const tokenIndexes = [...uniqueTokenColumns.map(column => [column])] as const
export const prohibitedTokenColumns = ["id"] as const
export const restrictedTokenColumns = ["id", "userId", "type"] as const

export type TokenDataTypes = CreateDataTypes<
    typeof tokens,
    typeof uniqueTokenColumns,
    typeof prohibitedTokenColumns,
    typeof restrictedTokenColumns
>

export type Token = TokenDataTypes["Readable"]
export type TokenType = Token["type"]
export type QueryableToken = TokenDataTypes["Queryable"]
export type IdentifiableToken = TokenDataTypes["Identifiable"]

export type WritableToken = TokenDataTypes["Writable"]
export type CreatableToken = TokenDataTypes["Creatable"]
export type UpdatableToken = TokenDataTypes["Updatable"]
