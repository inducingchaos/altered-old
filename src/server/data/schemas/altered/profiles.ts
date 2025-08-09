/**
 *
 */

import type { CreateDataTypes } from "@sdkit/utils/db/schema"
import { relations } from "drizzle-orm"
// import { timestamp, varchar } from "drizzle-orm/mysql-core"
import { timestamp, varchar, text } from "drizzle-orm/pg-core"
import { nanoid } from "nanoid"
import { users } from "./auth"
import { createAlteredPgTable } from "./helpers"

export const profiles = createAlteredPgTable("profiles", {
    // MySQL: id: varchar("id", { length: 255 }).primaryKey().$defaultFn(nanoid),
    id: varchar("id").primaryKey().$defaultFn(nanoid),
    // MySQL: userId: varchar("user_id", { length: 255 }).notNull(),
    userId: varchar("user_id").notNull(),

    // MySQL: username: varchar("username", { length: 255 }).unique(),
    username: varchar("username").unique(),
    // MySQL: bio: varchar("bio", { length: 255 }),
    bio: text("bio"),

    // MySQL: imageAttachmentId: varchar("image_attachment_id", { length: 255 }),
    imageAttachmentId: varchar("image_attachment_id"),

    createdAt: timestamp("created_at").notNull().defaultNow(),
    // MySQL: updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow()
    updatedAt: timestamp("updated_at").notNull().defaultNow()
})

export const profilesRelations = relations(profiles, ({ one }) => ({
    user: one(users, { fields: [profiles.userId], references: [users.id] })
}))

export const profilesDependencies = ["users"] as const

export const uniqueProfileColumns = ["id", "username"] as const
export const profileIndexes = [...uniqueProfileColumns.map(column => [column])] as const
export const prohibitedProfileColumns = ["id"] as const
export const restrictedProfileColumns = ["id", "userId"] as const

export type ProfileDataTypes = CreateDataTypes<
    typeof profiles,
    typeof uniqueProfileColumns,
    typeof prohibitedProfileColumns,
    typeof restrictedProfileColumns
>

export type Profile = ProfileDataTypes["Readable"]
export type QueryableProfile = ProfileDataTypes["Queryable"]
export type IdentifiableProfile = ProfileDataTypes["Identifiable"]

export type WritableProfile = ProfileDataTypes["Writable"]
export type CreatableProfile = ProfileDataTypes["Creatable"]
export type UpdatableProfile = ProfileDataTypes["Updatable"]
