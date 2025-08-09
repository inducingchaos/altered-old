/**
 *
 */

import type { CreateDataTypes } from "@sdkit/utils/db/schema"
import { relations } from "drizzle-orm"
// import { timestamp, unique, varchar } from "drizzle-orm/mysql-core"
import { timestamp, unique, varchar } from "drizzle-orm/pg-core"
import { users } from "."
// import { createAlteredMysqlTable } from "../helpers"
import { createAlteredPgTable } from "../helpers"
import { id } from "../../helpers"

export const accountTypes = ["email", "password", "google"] as const

// export const accounts = createAlteredMysqlTable(
export const accounts = createAlteredPgTable(
    "accounts",
    {
        id,
        // MySQL: userId: varchar("user_id", { length: 255 }).notNull(),
        userId: varchar("user_id").notNull(),

        // MySQL: type: varchar("type", { length: 255, enum: accountTypes }).notNull(),
        type: varchar("type").notNull(),
        // MySQL: providerId: varchar("provider_id", { length: 255 }).notNull(),
        providerId: varchar("provider_id").notNull(),

        verifiedAt: timestamp("verified_at")
    },
    table => [unique("user_id_type_idx").on(table.userId, table.type)]
)

export const accountsRelations = relations(accounts, ({ one }) => ({
    user: one(users, { fields: [accounts.userId], references: [users.id] })
}))

export const accountsDependencies = ["users"] as const

export const uniqueAccountColumns = ["id"] as const
export const accountIndexes = [...uniqueAccountColumns.map(column => [column]), ["userId", "type"]] as const
export const prohibitedAccountColumns = ["id"] as const
export const restrictedAccountColumns = ["id", "userId", "type"] as const

export type AccountDataTypes = CreateDataTypes<
    typeof accounts,
    typeof uniqueAccountColumns,
    typeof prohibitedAccountColumns,
    typeof restrictedAccountColumns
>

export type Account = AccountDataTypes["Readable"]
export type AccountType = Account["type"]
export type QueryableAccount = AccountDataTypes["Queryable"]
export type IdentifiableAccount = AccountDataTypes["Identifiable"]

export type WritableAccount = AccountDataTypes["Writable"]
export type CreatableAccount = AccountDataTypes["Creatable"]
export type UpdatableAccount = AccountDataTypes["Updatable"]
