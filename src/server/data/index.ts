/**
 *
 */

// import { Client } from "@planetscale/database"
// import { drizzle } from "drizzle-orm/planetscale-serverless"
import * as altered from "./schemas/altered"
import * as iiinput from "./schemas/iiinput"

export const schema = { ...altered, ...iiinput }

// export const connection = new Client({
//     host: process.env.DATABASE_HOST!,
//     username: process.env.DATABASE_USERNAME!,
//     password: process.env.DATABASE_PASSWORD!
// })

// export const db = drizzle(connection, { schema })
// export type Database = typeof db

import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"

// import * as schema from "./schema"

//  TODO: Set up `t3-env`.

if (!process.env.DATABASE_URL) throw new Error("Missing DATABASE_URL")

const client = postgres(process.env.DATABASE_URL, { prepare: false })
export const db = drizzle({ client, schema, casing: "snake_case" })
export type Database = typeof db
