/**
 *
 */

import type { PushSubscriptionConfig } from "@sdkit/types/comms/notifications/pwa"

export function serializeSubscriptionCredentials({ using: subscription }: { using: PushSubscriptionConfig }): string {
    const { endpoint, keys } = subscription

    return `${encodeURIComponent(endpoint)}:${keys.p256dh}:${keys.auth}`
}
