/**
 * @todo
 * - [P2] Refactor to use data access layer.
 */

import type { PushSubscriptionConfig } from "@sdkit/types/comms/notifications/pwa"
import { serializeSubscriptionCredentials } from "@sdkit/utils/comms/notifications/pwa"
import config from "~/config"
import { db } from "~/server/data"
import { tokens, type Token } from "~/server/data/schemas/altered"

export async function upsertPushNotificationToken({
    for: { userId },
    with: subscription
}: {
    for: { userId: number }
    with: PushSubscriptionConfig
}): Promise<Token> {
    "use server"

    const value = serializeSubscriptionCredentials({ using: subscription })
    const expiresAt = subscription.expirationTime
        ? new Date(subscription.expirationTime)
        : new Date(Date.now() + config.security.expirations.pushNotificationSubscription)

    const { id: tokenId } = (
        await db
            .insert(tokens)
            .values({
                userId,
                type: "push-notification",
                value,
                expiresAt
            })
            .onDuplicateKeyUpdate({
                set: {
                    value,
                    expiresAt
                }
            })
            .$returningId()
    )[0]!

    return (await db.query.tokens.findFirst({
        where: (tokens, { eq }) => eq(tokens.id, tokenId)
    }))!
}
