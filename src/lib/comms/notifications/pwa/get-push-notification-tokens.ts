/**
 * @todo
 * - [P2] Refactor to use data access layer.
 */

import { and } from "drizzle-orm"
import { db } from "~/server/data"
import { type Token } from "~/server/data/schemas/altered"

export async function getPushNotificationTokens({ for: query }: { for?: { userId?: number } }): Promise<Token[] | undefined> {
    "use server"

    const userId = query?.userId
    let tokens: Token[]

    if (userId) {
        tokens = await db.query.tokens.findMany({
            where: (tokens, { eq }) => and(eq(tokens.userId, userId), eq(tokens.type, "push-notification"))
        })
    } else {
        tokens = await db.query.tokens.findMany({
            where: (tokens, { eq }) => eq(tokens.type, "push-notification")
        })
    }

    return tokens.length > 0 ? tokens : undefined
}
