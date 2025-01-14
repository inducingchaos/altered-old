/**
 *
 */

// import "server-only"

// import type { Database } from "~/server/data"
// import type { CreatableUser, QueryableUser, User } from "~/server/data/schemas"
// import { createUser, getUser, updateUser } from "."

// export async function upsertUser({
//     where: query,
//     using: values,
//     in: db
// }: {
//     where: QueryableUser
//     using: CreatableUser
//     in: Database
// }): Promise<User> {
//     return await db.transaction(async tx => {
//         const user = await getUser({ where: query, from: tx })

//         if (user) return await updateUser({ where: query, using: values, in: tx })
//         else return await createUser({ using: values, in: tx })
//     })
// }
