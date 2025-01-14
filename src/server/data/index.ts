/**
 *
 */

import { Client } from "@planetscale/database"
import { drizzle } from "drizzle-orm/planetscale-serverless"
import * as altered from "./schemas/altered"
import * as iiinput from "./schemas/iiinput"

export const schema = { ...altered, ...iiinput }

export const connection = new Client({
    host: process.env.DATABASE_HOST!,
    username: process.env.DATABASE_USERNAME!,
    password: process.env.DATABASE_PASSWORD!
})

export const db = drizzle(connection, { schema })
export type Database = typeof db
