/**
 *
 */

import { Exception } from "@sdkit/meta"
import { getSubscriptionConfig } from "@sdkit/utils/comms/notifications/pwa"
import { deletePushNotificationToken } from "~/lib/comms/notifications/pwa"
import type { PWANotificationContextStateSetters } from "../types"

export async function pwaNotificationsContextHandleUnsubscribe({
    subscription,
    setSubscription,
    setError
}: {
    subscription: PushSubscription | null | undefined
    setSubscription: PWANotificationContextStateSetters["setSubscription"]
    setError: PWANotificationContextStateSetters["setError"]
}): Promise<void> {
    try {
        if (subscription) {
            const subscriptionConfig = getSubscriptionConfig({ for: subscription })
            await deletePushNotificationToken({ for: { userId: 1 }, using: subscriptionConfig })

            await subscription.unsubscribe()
        }

        setSubscription?.(null)
        setError?.(null)
    } catch (err) {
        setError?.(
            new Exception({
                in: "comms",
                of: "send-failed",
                with: {
                    internal: {
                        label: "Push Unsubscription Failed",
                        message: err instanceof Error ? err.message : "Failed to unsubscribe from notifications"
                    }
                }
            })
        )
    }
}
