/**
 * Temporary development values storage
 */

import { relations } from "drizzle-orm"
import { index, timestamp, varchar } from "drizzle-orm/mysql-core"
import { nanoid } from "nanoid"
import type { CreateDataTypes } from "~/packages/sdkit/src/utils/db/schema"
import { createIiinputMysqlTable } from "./helpers"
import { thoughts } from "./thoughts"

export const temp = createIiinputMysqlTable(
    "temp",
    {
        id: varchar("id", { length: 255 }).primaryKey().$defaultFn(nanoid),
        thoughtId: varchar("thought_id", { length: 255 }).notNull(),

        key: varchar("key", { length: 255 }).notNull(),
        value: varchar("value", { length: 255 }).notNull(),

        createdAt: timestamp("created_at").notNull().defaultNow(),
        updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow()
    },
    tempTable => [index("key_idx").on(tempTable.key), index("thought_id_idx").on(tempTable.thoughtId)]
)

export const tempRelations = relations(temp, ({ one }) => ({
    thought: one(thoughts, {
        fields: [temp.thoughtId],
        references: [thoughts.id]
    })
}))

export const tempDependencies = ["thoughts"] as const

export const uniqueTempColumns = ["id"] as const
export const tempIndexes = [...uniqueTempColumns.map(column => [column])] as const
export const prohibitedTempColumns = ["id", "createdAt", "updatedAt"] as const
export const restrictedTempColumns = ["id", "thoughtId", "createdAt", "updatedAt"] as const

export type TempDataTypes = CreateDataTypes<
    typeof temp,
    typeof uniqueTempColumns,
    typeof prohibitedTempColumns,
    typeof restrictedTempColumns
>

export type Temp = TempDataTypes["Readable"]
export type QueryableTemp = TempDataTypes["Queryable"]
export type IdentifiableTemp = TempDataTypes["Identifiable"]

export type WritableTemp = TempDataTypes["Writable"]
export type CreatableTemp = TempDataTypes["Creatable"]
export type UpdatableTemp = TempDataTypes["Updatable"]
