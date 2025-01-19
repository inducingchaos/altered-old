/**
 *
 */

import { TOKEN_DELIMITER } from "@sdkit/constants"
import { Exception } from "@sdkit/meta"
import type { PushSubscriptionConfig } from "@sdkit/types/comms/notifications/pwa"

export function deserializeSubscriptionCredentials({
    using: subscription,
    expiresAt: expirationTime
}: {
    using: string
    expiresAt?: Date
}): PushSubscriptionConfig {
    const [endpoint, p256dh, auth] = subscription.split(TOKEN_DELIMITER)

    if (!endpoint || !p256dh || !auth)
        throw new Exception({
            in: "data",
            of: "invalid-data",
            with: {
                internal: {
                    label: "Failed to Deserialize Push Notification Token",
                    message: "The string provided to `deserializeSubscription` contains invalid data."
                }
            },
            and: {
                token: subscription
            }
        })

    return {
        endpoint: decodeURIComponent(endpoint),
        keys: { p256dh, auth },
        expirationTime: expirationTime ? expirationTime.getTime() : undefined
    }
}
