/**
 *
 */

import { timestamp } from "drizzle-orm/mysql-core"

export const createdAt = timestamp("created_at").notNull().defaultNow()
