/**
 *
 */

// import { varchar } from "drizzle-orm/mysql-core"
import { varchar } from "drizzle-orm/pg-core"
import { nanoid } from "nanoid"

// export const id = varchar("id", { length: 255 }).primaryKey().$defaultFn(nanoid)
export const id = varchar("id").primaryKey().$defaultFn(nanoid)
