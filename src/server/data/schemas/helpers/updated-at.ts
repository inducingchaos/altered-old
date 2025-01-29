/**
 *
 */

import { timestamp } from "drizzle-orm/mysql-core"

export const updatedAt = timestamp("updated_at").notNull().defaultNow().onUpdateNow()
