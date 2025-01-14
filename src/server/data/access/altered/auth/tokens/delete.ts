/**
 *
 */

// import { eq } from "drizzle-orm"
// import { db, type Database } from "~/server/data"
// import { tokens, type QueryableToken } from "~/server/data/schemas"
// import { buildWhereClause } from "~/utils/db/schema/build-where-clause"

// export async function deleteVerifyEmailToken(token: string) {
//     await db.delete(tokens).where(eq(tokens.value, token))
// }

// export async function deleteMagicToken(token: string) {
//     await db.delete(tokens).where(eq(tokens.value, token))
// }

// export async function deleteToken({ where: query, from: db }: { where: QueryableToken; from: Database }): Promise<void> {
//     await db.delete(tokens).where(buildWhereClause({ using: query, for: tokens }))
// }

// export async function deletePasswordResetToken(token: string, trx = db) {
//     await trx.delete(tokens).where(eq(tokens.value, token))
// }
