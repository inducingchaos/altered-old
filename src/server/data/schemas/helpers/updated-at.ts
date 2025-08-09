/**
 *
 */

// import { timestamp } from "drizzle-orm/mysql-core"
import { timestamp } from "drizzle-orm/pg-core"

// export const updatedAt = timestamp("updated_at").notNull().defaultNow().onUpdateNow()
export const updatedAt = timestamp("updated_at").notNull().defaultNow()
