// /**
//  *
//  */

// import { Exception } from "@sdkit/meta"
// import { buildWhereClause } from "@sdkit/utils/db/schema"
// import { accounts, type Account, type QueryableAccount, type UpdatableAccount } from "~/server/data/schemas/altered"
// import { getAccount } from "."
// import type { drizzle } from "drizzle-orm/planetscale-serverless"

// export async function updateAccount<Database extends ReturnType<typeof drizzle>>({
//     where: query,
//     using: values,
//     in: db
// }: {
//     where: QueryableAccount
//     using: UpdatableAccount
//     in: Database
// }): Promise<Account> {
//     return await db.transaction(async tx => {
//         const account = await getAccount({ where: query, from: tx })
//         if (!account)
//             throw new Exception({
//                 in: "data",
//                 of: "resource-not-found",
//                 with: {
//                     internal: {
//                         label: "Failed to Update Account",
//                         message: "The query for the account to update did not return any results."
//                     }
//                 },
//                 and: {
//                     query,
//                     values
//                 }
//             })

//         await tx
//             .update(accounts)
//             .set(values)
//             .where(buildWhereClause({ using: query, for: accounts }))
//         return (await tx.query.accounts.findFirst({ where: buildWhereClause({ using: values, for: accounts }) }))!
//     })
// }
