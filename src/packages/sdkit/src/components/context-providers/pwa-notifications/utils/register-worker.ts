/**
 *
 */

import { Exception } from "@sdkit/meta/exception"
import config from "~/config"
import type { PWANotificationContextStateSetters } from "../types"

export async function pwaNotificationsContextRegisterWorker({
    setSubscription,
    setError
}: {
    setSubscription: PWANotificationContextStateSetters["setSubscription"]
    setError: PWANotificationContextStateSetters["setError"]
}): Promise<void> {
    try {
        const registration = await navigator.serviceWorker.register(config.paths.assets.workers.notifications, {
            scope: "/",
            updateViaCache: "none"
        })

        const existingSubscription = await registration.pushManager.getSubscription()

        setSubscription?.(existingSubscription)
        setError?.(null)
    } catch (err) {
        setError?.(
            new Exception({
                in: "comms",
                of: "send-failed",
                with: {
                    internal: {
                        label: "Service Worker Registration Failed",
                        message: err instanceof Error ? err.message : "Failed to register service worker"
                    }
                }
            })
        )
    }
}
