/**
 *
 */

import { varchar } from "drizzle-orm/mysql-core"
import { nanoid } from "nanoid"

export const id = varchar("id", { length: 255 }).primaryKey().$defaultFn(nanoid)
