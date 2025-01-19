/**
 * @todo
 * - [P2] Refactor to use data access layer.
 */

"use server"

import type { PushSubscriptionConfig } from "@sdkit/types/comms/notifications/pwa"
import { serializeSubscriptionCredentials } from "@sdkit/utils/comms/notifications/pwa"
import { and, eq } from "drizzle-orm"
import { db } from "~/server/data"
import { tokens } from "~/server/data/schemas/altered"

export async function deletePushNotificationToken({
    for: { userId },
    using: subscription
}: {
    for: { userId: number }
    using: PushSubscriptionConfig
}): Promise<void> {
    const value = serializeSubscriptionCredentials({ using: subscription })

    await db.delete(tokens).where(and(eq(tokens.userId, userId), eq(tokens.type, "push-notification"), eq(tokens.value, value)))
}
