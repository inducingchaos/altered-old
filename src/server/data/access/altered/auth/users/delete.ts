/**
 *
 */

// import "server-only"

// import { eq } from "drizzle-orm"
// import type { Database } from "~/server/data"
// import { accounts, profiles, sessions, tokens, users, type UserID } from "~/server/data/schemas"
// import { dependantOperations } from "~/utils/db/integrity"

// export async function deleteUser({ for: id, from: db }: { for: UserID; from: Database }): Promise<void> {
//     await db.transaction(async tx => {
//         await tx.delete(users).where(eq(users.id, id))

//         dependantOperations({
//             for: "users",
//             using: {
//                 accounts: await tx.delete(accounts).where(eq(accounts.userId, id)),
//                 tokens: await tx.delete(tokens).where(eq(tokens.userId, id)),
//                 sessions: await tx.delete(sessions).where(eq(sessions.userId, id)),
//                 profiles: await tx.delete(profiles).where(eq(profiles.userId, id))
//             }
//         })
//     })
// }
