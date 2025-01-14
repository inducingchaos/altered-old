/**
 *
 */

// import { eq } from "drizzle-orm"
// import { Exception } from "~/packages/sdkit/src/meta"
// import { type Database } from "~/server/data"
// import { tokens, type QueryableToken, type Token, type UpdatableToken } from "~/server/data/schemas"
// import { getToken } from "."

// export async function updateToken({
//     where: query,
//     using: values,
//     in: db
// }: {
//     where: QueryableToken
//     using: UpdatableToken
//     in: Database
// }): Promise<Token> {
//     return await db.transaction(async tx => {
//         const token = await getToken({ where: query, from: tx })
//         if (!token)
//             throw new Exception({
//                 in: "data",
//                 of: "resource-not-found",
//                 with: {
//                     internal: {
//                         label: "resource-not-found",
//                         message: "Token not found"
//                     }
//                 },
//                 and: {
//                     query,
//                     values
//                 }
//             })

//         await tx.update(tokens).set(values).where(eq(tokens.value, token.value))

//         return (await tx.query.tokens.findFirst({
//             where: eq(tokens.id, token.id)
//         }))!
//     })
// }
