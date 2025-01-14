/**
 *
 */

// import "server-only"

// import { Exception } from "~/packages/sdkit/src/meta"
// import { type Database } from "~/server/data"
// import { users, type QueryableUser, type UpdatableUser, type User } from "~/server/data/schemas"
// import { buildWhereClause } from "~/utils/db/schema/build-where-clause"
// import { getUser } from "."

// export async function updateUser({
//     where: query,
//     using: values,
//     in: db
// }: {
//     where: QueryableUser
//     using: UpdatableUser
//     in: Database
// }): Promise<User> {
//     return await db.transaction(async tx => {
//         const user = await getUser({ where: query, from: tx })
//         if (!user)
//             throw new Exception({
//                 in: "data",
//                 of: "resource-not-found",
//                 with: {
//                     internal: {
//                         label: "Failed to Update User",
//                         message: "The query for the user to update did not return any results."
//                     }
//                 },
//                 and: {
//                     query
//                 }
//             })

//         await tx
//             .update(users)
//             .set(values)
//             .where(buildWhereClause({ using: query, for: users }))

//         return (await tx.query.users.findFirst({ where: buildWhereClause({ using: { ...query, ...values }, for: users }) }))!
//     })
// }
