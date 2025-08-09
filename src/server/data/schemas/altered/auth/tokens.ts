/**
 *
 */

import type { CreateDataTypes } from "@sdkit/utils/db/schema"
import { relations } from "drizzle-orm"
// import { timestamp, varchar } from "drizzle-orm/mysql-core"
import { timestamp, varchar } from "drizzle-orm/pg-core"
import { nanoid } from "nanoid"
import { users } from "."
// import { createAlteredMysqlTable } from "../helpers"
import { createAlteredPgTable } from "../helpers"

export const tokenTypes = ["password-reset", "email-verification", "magic-link", "session", "push-notification"] as const

// export const tokens = createAlteredMysqlTable(
export const tokens = createAlteredPgTable(
    "tokens",
    {
        // MySQL: id: varchar("id", { length: 255 }).primaryKey().$defaultFn(nanoid),
        id: varchar("id").primaryKey().$defaultFn(nanoid),
        // MySQL: userId: varchar("user_id", { length: 255 }).notNull(),
        userId: varchar("user_id").notNull(),

        // MySQL: type: varchar("type", { length: 255, enum: tokenTypes }).notNull(),
        type: varchar("type").notNull(),
        // MySQL: value: varchar("value", { length: 768 }).notNull(),
        value: varchar("value").notNull(),

        expiresAt: timestamp("expires_at").notNull()
    }
    // disabled cuz f SQL
    // token => [uniqueIndex("userId_type_value_idx").on(token.userId, token.type, token.value)]
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
