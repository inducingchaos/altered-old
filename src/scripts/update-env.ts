/**
 *
 */

import type { CreateProjectEnv12 } from "@vercel/sdk/models/createprojectenvop.js"
import { parse } from "dotenv"
import { readFileSync } from "fs"
import { vercel } from "~/lib/providers"

const PROJECT_NAME = "altered"

async function updateEnv(): Promise<void> {
    try {
        const env = parse(readFileSync(".env", "utf8"))
        const mappedEnv = Object.entries(env).map(([key, value]) => ({
            key,
            value,
            target: ["production", "preview", "development"],
            type: key.includes("PUBLIC") ? "plain" : "encrypted",
            comment: undefined
        }))

        await vercel.projects.createProjectEnv({
            idOrName: PROJECT_NAME,
            upsert: "true",
            requestBody: mappedEnv as unknown as CreateProjectEnv12
        })
    } catch (error) {
        console.error(error instanceof Error ? `Error: ${error.message}` : String(error))
    }
}

await updateEnv()
