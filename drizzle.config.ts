// /**
//  *
//  */

// import { type Config } from "drizzle-kit"
// import { createUrl } from "@sdkit/utils/db/connection/planetscale"

// export default {
//     schema: ["./src/server/data/schemas/altered", "./src/server/data/schemas/iiinput"],
//     dialect: "mysql",
//     dbCredentials: {
//         url: createUrl({
//             database: process.env.DATABASE_NAME!,
//             host: process.env.DATABASE_HOST!,
//             username: process.env.DATABASE_USERNAME!,
//             password: process.env.DATABASE_PASSWORD!
//         })
//     },
//     tablesFilter: "*"
// } satisfies Config

/**
 *
 */

import { defineConfig } from "drizzle-kit"

//  TODO: Setup `t3-env`.

if (!process.env.DATABASE_URL) throw new Error("Missing DATABASE_URL")

const nonPoolingUrl = process.env.DATABASE_URL.replace("6543", "5432")

export default defineConfig({
    schema: ["./src/server/data/schemas/altered", "./src/server/data/schemas/iiinput"],
    dialect: "postgresql",
    dbCredentials: {
        url: nonPoolingUrl
    },
    casing: "snake_case"
})
