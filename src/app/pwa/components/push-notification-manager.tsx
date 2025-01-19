/**
 *
 */

import { getSubscriptionConfig } from "@sdkit/utils/comms/notifications/pwa"
import { useEffect, useState, type JSX } from "react"
import config from "~/config"
import { deletePushNotificationToken, upsertPushNotificationToken } from "~/lib/comms/notifications/pwa"
import { urlBase64ToUint8Array } from "../utils"

export function PushNotificationManager(): JSX.Element {
    const [isSupported, setIsSupported] = useState(false)
    const [workerSubscription, setWorkerSubscription] = useState<PushSubscription | null>(null)

    const registerServiceWorker = async (): Promise<void> => {
        const registration = await navigator.serviceWorker.register(config.paths.assets.workers.notifications, {
            scope: "/",
            updateViaCache: "none"
        })

        const existingSubscription = await registration.pushManager.getSubscription()
        setWorkerSubscription(existingSubscription)
    }

    const enablePushNotifications = async (): Promise<void> => {
        const registration = await navigator.serviceWorker.ready
        const workerSub = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_PWA_NOTIFICATIONS!)
        })

        setWorkerSubscription(workerSub)

        const subscriptionConfig = getSubscriptionConfig({ for: workerSub })
        await upsertPushNotificationToken({ for: { userId: 1 }, with: subscriptionConfig })
    }

    const disablePushNotifications = async (): Promise<void> => {
        if (!workerSubscription) return

        await workerSubscription?.unsubscribe()
        setWorkerSubscription(null)

        const subscriptionConfig = getSubscriptionConfig({ for: workerSubscription })
        await deletePushNotificationToken({ for: { userId: 1 }, using: subscriptionConfig })
    }

    useEffect(() => {
        if ("serviceWorker" in navigator && "PushManager" in window) {
            setIsSupported(true)

            void registerServiceWorker()
        }
    }, [])

    if (!isSupported) return <p>{"Push notifications are not supported in this browser."}</p>

    return (
        <div className="flex flex-col items-center justify-center">
            <h3 className="text-24px font-bold">Push Notifications</h3>
            {workerSubscription ? (
                <>
                    <p>{"You are subscribed to push notifications."}</p>
                    <button className="bg-main text-alternate" onClick={disablePushNotifications}>
                        {"Unsubscribe"}
                    </button>
                </>
            ) : (
                <>
                    <p>{"You are not subscribed to push notifications."}</p>
                    <button className="bg-main text-alternate" onClick={enablePushNotifications}>
                        {"Subscribe"}
                    </button>
                </>
            )}
        </div>
    )
}
