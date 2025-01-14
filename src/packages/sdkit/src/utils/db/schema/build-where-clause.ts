/**
 *
 */

import { and, eq, type SQL } from "drizzle-orm"
import type { MySqlColumn, MySqlTable } from "drizzle-orm/mysql-core"

export function buildWhereClause<Schema extends MySqlTable, Data extends Schema["_"]["inferSelect"]>({
    using: query,
    for: schema
}: {
    using: Partial<Data>
    for: Schema
}): SQL<unknown> | undefined {
    return and(
        ...Object.entries(query)
            .filter(([_, queryValue]) => queryValue !== undefined)
            .map(([queryKey, queryValue]) => eq(schema[queryKey as keyof typeof schema] as MySqlColumn, queryValue))
    )
}
