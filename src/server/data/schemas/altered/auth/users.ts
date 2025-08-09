/**
 *
 */

import type { CreateDataTypes } from "@sdkit/utils/db/schema"
import { relations } from "drizzle-orm"
// import { varchar } from "drizzle-orm/mysql-core"
import { varchar } from "drizzle-orm/pg-core"
import { accounts, profiles, tokens } from "."
import { createdAt, id, updatedAt } from "../../helpers"
// import { createAlteredMysqlTable } from "../helpers"
import { createAlteredPgTable } from "../helpers"

// export const users = createAlteredMysqlTable("users", {
export const users = createAlteredPgTable("users", {
    id,
    // MySQL: name: varchar("name", { length: 255 }),
    name: varchar("name"),

    createdAt,
    updatedAt
})

export const usersRelations = relations(users, ({ many }) => ({
    accounts: many(accounts),
    tokens: many(tokens),
    profiles: many(profiles)
}))

export const usersDependencies = [] as const

export const uniqueUserColumns = ["id"] as const
export const userIndexes = [...uniqueUserColumns.map(column => [column])] as const
export const prohibitedUserColumns = ["id", "createdAt", "updatedAt"] as const
export const restrictedUserColumns = ["id", "createdAt", "updatedAt"] as const

export type UserDataTypes = CreateDataTypes<
    typeof users,
    typeof uniqueUserColumns,
    typeof prohibitedUserColumns,
    typeof restrictedUserColumns
>

export type User = UserDataTypes["Readable"]
export type UserID = User["id"]
export type QueryableUser = UserDataTypes["Queryable"]
export type IdentifiableUser = UserDataTypes["Identifiable"]

export type WritableUser = UserDataTypes["Writable"]
export type CreatableUser = UserDataTypes["Creatable"]
export type UpdatableUser = UserDataTypes["Updatable"]
