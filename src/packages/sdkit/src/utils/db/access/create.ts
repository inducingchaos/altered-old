/**
 *
 */

// "server only"

import { Exception } from "@sdkit/meta"
import type { CreateCreatableData, CreateReadableData, CreateWritableData } from "@sdkit/utils/db/schema"
import { buildWhereClause } from "@sdkit/utils/db/schema"
import type { AllowReturningFunctionsForPropertyValues, ArrayToUnion, StrictPartial } from "@sdkit/utils/types"
import { getTableName } from "drizzle-orm"
import type { MySqlTable } from "drizzle-orm/mysql-core"
import type { drizzle } from "drizzle-orm/planetscale-serverless"

export function initializeCreateDataFunction<
    Database extends ReturnType<typeof drizzle>,
    Schema extends MySqlTable,
    Data extends CreateReadableData<Schema>,
    ProhibitedColumns extends readonly (string & keyof CreateWritableData<Schema>)[],
    DataIndexes extends readonly (readonly (string & keyof CreateReadableData<Schema>)[])[],
    CreatableData extends CreateCreatableData<Schema, ArrayToUnion<ProhibitedColumns>>,
    DefaultData extends StrictPartial<AllowReturningFunctionsForPropertyValues<CreatableData>, DefaultData>,
    DefaultedCreatableData extends Omit<CreatableData, keyof DefaultData> &
        Partial<Pick<CreatableData, Extract<keyof DefaultData, keyof CreatableData>>>
>({
    for: schema,
    with: {
        columns: { prohibited: prohibitedColumns },
        indexes,
        defaults: defaultValues
    }
}: {
    for: Schema
    with: {
        columns: {
            prohibited: ProhibitedColumns
        }
        indexes: DataIndexes
        defaults?: DefaultData
    }
}): (params: { using: DefaultedCreatableData; in: Database }) => Promise<Data> {
    return async ({ using: values, in: db }) => {
        try {
            return await db.transaction(async tx => {
                const allColumns = Object.keys(schema).filter(key => !key.startsWith("$"))
                const creatableColumns = allColumns.filter(
                    column => !prohibitedColumns.includes(column as ProhibitedColumns[number])
                )

                const hasQueryableValue = indexes.some(index =>
                    index.every(IndexColumn => creatableColumns.includes(IndexColumn))
                )

                if (hasQueryableValue) {
                    const queryableKeys: string[] = Object.keys(values).filter(key => values[key as keyof typeof values])
                    const queryIndex = indexes.find(index => index.every(key => queryableKeys.includes(key)))
                    if (!queryIndex) {
                        throw new Exception({
                            in: "logic",
                            of: "incorrect-usage",
                            with: {
                                internal: {
                                    label: "Failed to Create Data",
                                    message:
                                        "Unable to check for existing data. The provided values do not match any of the schema's indexes."
                                }
                            },
                            and: {
                                table: getTableName(schema),
                                values,
                                indexes
                            }
                        })
                    }

                    const query = Object.fromEntries(queryIndex.map(key => [key, values[key]]))
                    const existing = await tx
                        .select()
                        .from(schema)
                        .where(buildWhereClause({ using: query, for: schema }))

                    if (existing.length) {
                        throw new Exception({
                            in: "data",
                            of: "duplicate-identifier",
                            with: {
                                internal: {
                                    label: "Failed to Create Data",
                                    message: "A row with conflicting values already exists in the database."
                                }
                            },
                            and: {
                                table: getTableName(schema),
                                existing: existing[0],
                                provided: values
                            }
                        })
                    }
                }

                if (defaultValues)
                    await Promise.all(
                        Object.entries(defaultValues).map(async ([key, defaultValue]) => {
                            const valuesKey = key as keyof typeof values
                            if (values[valuesKey] === undefined) {
                                const isFunction = typeof defaultValue === "function"
                                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
                                const newValue = isFunction ? await defaultValue() : defaultValue

                                values[valuesKey] = newValue as (typeof values)[typeof valuesKey]
                            }
                        })
                    )

                await tx.insert(schema).values(values)

                const data = (
                    await tx
                        .select()
                        .from(schema)
                        .where(buildWhereClause({ using: values, for: schema }))
                )[0]

                if (!data)
                    throw new Exception({
                        in: "data",
                        of: "unknown",
                        with: {
                            internal: {
                                label: "Failed to Create Data",
                                message: "An unknown error occurred while fetching the created data."
                            }
                        },
                        and: {
                            table: getTableName(schema),
                            values
                        }
                    })

                return data as Data
            })
        } catch (error) {
            if (error instanceof Exception) throw error
            throw new Exception({
                in: "data",
                of: "unknown",
                with: {
                    internal: { label: "Failed to Create Data", message: "An unknown error occurred during creation." }
                },
                and: {
                    table: getTableName(schema),
                    values,
                    error
                }
            })
        }
    }
}
