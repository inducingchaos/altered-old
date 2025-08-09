/**
 *
 */

import type { ArrayToUnion } from "@sdkit/utils/types"
// import type { MySqlTable } from "drizzle-orm/mysql-core"
import type { PgTable } from "drizzle-orm/pg-core"

export type CreateReadableData<Schema extends PgTable> = Schema["$inferSelect"]
export type CreateQueryableData<Schema extends PgTable> = Partial<CreateReadableData<Schema>>
export type CreateIdentifiableData<Schema extends PgTable, UniqueColumn extends keyof CreateQueryableData<Schema>> = Pick<
    CreateQueryableData<Schema>,
    UniqueColumn
>
export type CreateWritableData<Schema extends PgTable> = Schema["$inferInsert"]
export type CreateCreatableData<Schema extends PgTable, ProhibitedColumn extends keyof CreateWritableData<Schema>> = Omit<
    CreateWritableData<Schema>,
    ProhibitedColumn
>
export type CreateUpdatableData<Schema extends PgTable, RestrictedColumn extends keyof CreateWritableData<Schema>> = Partial<
    Omit<CreateWritableData<Schema>, RestrictedColumn>
>

export type CreateDataTypes<
    Schema extends PgTable,
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
