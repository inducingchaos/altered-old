/**
 *
 */

import type { ArrayToUnion } from "@sdkit/utils/types"
import type { MySqlTable } from "drizzle-orm/mysql-core"

export type CreateReadableData<Schema extends MySqlTable> = Schema["$inferSelect"]
export type CreateQueryableData<Schema extends MySqlTable> = Partial<CreateReadableData<Schema>>
export type CreateIdentifiableData<Schema extends MySqlTable, UniqueColumn extends keyof CreateQueryableData<Schema>> = Pick<
    CreateQueryableData<Schema>,
    UniqueColumn
>
export type CreateWritableData<Schema extends MySqlTable> = Schema["$inferInsert"]
export type CreateCreatableData<Schema extends MySqlTable, ProhibitedColumn extends keyof CreateWritableData<Schema>> = Omit<
    CreateWritableData<Schema>,
    ProhibitedColumn
>
export type CreateUpdatableData<Schema extends MySqlTable, RestrictedColumn extends keyof CreateWritableData<Schema>> = Partial<
    Omit<CreateWritableData<Schema>, RestrictedColumn>
>

export type CreateDataTypes<
    Schema extends MySqlTable,
    UniqueColumns extends readonly (string & keyof CreateReadableData<Schema>)[],
    ProhibitedColumns extends readonly (string & keyof CreateWritableData<Schema>)[],
    RestrictedColumns extends readonly (string & keyof CreateWritableData<Schema>)[]
> = {
    Readable: CreateReadableData<Schema>
    Queryable: CreateQueryableData<Schema>
    Identifiable: CreateIdentifiableData<Schema, ArrayToUnion<UniqueColumns>>
    Writable: CreateWritableData<Schema>
    Creatable: CreateCreatableData<Schema, ArrayToUnion<ProhibitedColumns>>
    Updatable: CreateUpdatableData<Schema, ArrayToUnion<RestrictedColumns>>
}
