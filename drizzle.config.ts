/**
 *
 */

import { type Config } from "drizzle-kit"
import { createUrl } from "@sdkit/utils/db/connection/planetscale"

export default {
    schema: ["./src/server/data/schemas"],
    dialect: "mysql",
    dbCredentials: {
        url: createUrl({
            database: process.env.DATABASE_NAME!,
            host: process.env.DATABASE_HOST!,
            username: process.env.DATABASE_USERNAME!,
            password: process.env.DATABASE_PASSWORD!
        })
    },
    tablesFilter: "*"
} satisfies Config
