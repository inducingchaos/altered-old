/**
 *
 */

import type { PgTableFn } from "drizzle-orm/pg-core"
import { pgTableCreator } from "drizzle-orm/pg-core/table"
import type { Project } from "~/config"

export const createTableName = ({ for: projectName, from: tableName }: { for?: Project | ""; from: string }): string => {
    const resolvedProjectName = (projectName ?? "").toLowerCase().replace(/[ -]/g, "_")

    return `${resolvedProjectName}${resolvedProjectName ? "_" : ""}${tableName}`
}

// export function createMysqlTable({ for: projectName }: { for?: Project }): MySqlTableFn<undefined> {
//     return mysqlTableCreator((tableName: string): string => createTableName({ for: projectName, from: tableName }))
// }

export function createPgTable({ for: projectName }: { for?: Project }): PgTableFn<undefined> {
    return pgTableCreator((tableName: string): string => createTableName({ for: projectName, from: tableName }))
}
