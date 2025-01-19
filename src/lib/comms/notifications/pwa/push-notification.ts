/**
 *
 */

"use server"

import { sendNotification, type SendResult } from "web-push"
import config from "~/config"
import { getPushNotificationTokens } from "./get-push-notification-tokens"
import { deserializeSubscriptionCredentials } from "~/packages/sdkit/src/utils/comms/notifications/pwa/deserialize-subscription-credentials"

export async function pushNotification({
    with: { title, message, url },
    to: recipient
}: {
    with: { title?: string; message?: string; url?: string }
    to?: { userId?: number }
}): Promise<SendResult[]> {
    const userId = recipient?.userId
    const tokens = await getPushNotificationTokens({ for: { userId } })

    const subscriptionConfigs = tokens?.map(token => deserializeSubscriptionCredentials({ using: token.value }))
    if (!subscriptionConfigs) return []

    //  Maybe add a retry mechanism here, and/or logging to track who received what.

    return await Promise.all(
        subscriptionConfigs.map(
            async subscription =>
                await sendNotification(
                    subscription,
                    JSON.stringify({
                        title,
                        body: message,
                        icon: config.paths.assets.appIcon,
                        url
                    }),
                    {
                        vapidDetails: {
                            subject: `mailto:${config.brand.emails.support}`,
                            publicKey: process.env.NEXT_PUBLIC_PWA_NOTIFICATIONS!,
                            privateKey: process.env.PWA_NOTIFICATIONS_SECRET!
                        }
                    }
                )
        )
    )
}
