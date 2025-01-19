/**
 *
 */

import { Exception } from "@sdkit/meta"
import type { PushSubscriptionConfig } from "@sdkit/types/comms/notifications/pwa"

export function getSubscriptionConfig({ for: subscription }: { for: PushSubscription }): PushSubscriptionConfig {
    const { endpoint, expirationTime, keys } = subscription.toJSON()

    if (!endpoint)
        throw new Exception({
            in: "logic",
            of: "unhandled-edge-case",
            with: {
                internal: {
                    label: "Failed to Get Push Subscription Config",
                    message: "The provided subscription does not have an endpoint."
                }
            },
            and: {
                subscription
            }
        })

    return {
        endpoint,
        expirationTime,
        keys: keys as PushSubscriptionConfig["keys"]
    }
}
