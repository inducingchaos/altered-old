/**
 *
 */

// import "server-only"

import { Exception } from "@sdkit/meta"
import { buildWhereClause } from "@sdkit/utils/db/schema"
import type { MySqlTable } from "drizzle-orm/mysql-core"
import type { drizzle } from "drizzle-orm/planetscale-serverless"

export function initializeGetDataFunction<
    Database extends ReturnType<typeof drizzle>,
    Schema extends MySqlTable,
    Data extends Schema["_"]["inferSelect"],
    SelectMany extends boolean = true
>({
    for: schema,
    selectMany = false as SelectMany
}: {
    for: Schema
    selectMany?: SelectMany
}): ({
    where,
    from
}: {
    where: Partial<Data>
    from: Database
}) => Promise<SelectMany extends true ? Data[] : Data | undefined> {
    return async ({ where: query, from: db }) => {
        try {
            const data = await db
                .select()
                .from(schema)
                .where(buildWhereClause({ using: query, for: schema }))

            if (selectMany === false && data.length > 1)
                throw new Exception({
                    in: "logic",
                    of: "incorrect-usage",
                    with: {
                        internal: {
                            label: "Multiple Results for Single Query",
                            message: "Expected a single result, but received multiple."
                        }
                    },
                    and: {
                        query,
                        data
                    }
                })

            return (selectMany ? data : data[0]) as SelectMany extends true ? Data[] : Data | undefined
        } catch (error) {
            if (error instanceof Exception) throw error
            throw new Exception({
                in: "data",
                of: "unknown",
                with: {
                    internal: {
                        label: "Failed to Retrieve Data",
                        message: "An unknown error occurred while retrieving data."
                    }
                },
                and: {
                    error,
                    query
                }
            })
        }
    }
}
