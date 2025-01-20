/**
 *
 */

import { Exception } from "@sdkit/meta/exception"
import { getSubscriptionConfig } from "@sdkit/utils/comms/notifications/pwa"
import { upsertPushNotificationToken } from "~/lib/comms/notifications/pwa"
import { urlBase64ToUint8Array } from "~/app/pwa/utils"
import type { PWANotificationContextStateSetters } from "../types"
import { isPermissionGranted } from "./is-permission-granted"

export async function pwaNotificationsContextHandleSubscribe({
    setSubscription,
    setError,
    setIsGrantedPermission
}: {
    setSubscription: PWANotificationContextStateSetters["setSubscription"]
    setError: PWANotificationContextStateSetters["setError"]
    setIsGrantedPermission: PWANotificationContextStateSetters["setIsGrantedPermission"]
}): Promise<void> {
    try {
        const registration = await navigator.serviceWorker.ready
        const subscription =
            (await registration.pushManager.getSubscription()) ??
            (await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_PWA_NOTIFICATIONS!)
            }))

        const subscriptionConfig = getSubscriptionConfig({ for: subscription })
        await upsertPushNotificationToken({ for: { userId: 1 }, with: subscriptionConfig })

        setIsGrantedPermission?.(isPermissionGranted())
        setSubscription?.(subscription)
        setError?.(null)
    } catch (err) {
        setIsGrantedPermission?.(isPermissionGranted())
        setError?.(
            new Exception({
                in: "comms",
                of: "send-failed",
                with: {
                    internal: {
                        label: "Push Subscription Failed",
                        message: err instanceof Error ? err.message : "Failed to subscribe to notifications"
                    }
                }
            })
        )
    }
}
