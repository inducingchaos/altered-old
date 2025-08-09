/**
 *
 */

// import { timestamp } from "drizzle-orm/mysql-core"
import { timestamp } from "drizzle-orm/pg-core"

export const createdAt = timestamp("created_at").notNull().defaultNow()
