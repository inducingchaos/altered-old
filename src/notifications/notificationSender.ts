/**
 *
 */

import { sendNotification as _sendNotification, setVapidDetails, type PushSubscription } from "web-push"
import config from "~/config"

setVapidDetails(
    `mailto:${config.brand.emails.support}`,
    process.env.NEXT_PUBLIC_PWA_NOTIFICATIONS ?? "",
    process.env.PWA_NOTIFICATIONS_SECRET ?? ""
)

export const sendNotification = async (subscription: PushSubscription, title: string, message: string): Promise<void> => {
    const pushPayload: Record<string, string> = {
        title,
        body: message,
        icon: "/brand/app-icon-512x512.png",
        url: process.env.NOTIFICATION_URL ?? "/",
        badge: "/brand/app-icon-512x512.png"
    }

    try {
        await _sendNotification(subscription, JSON.stringify(pushPayload))
        console.log("Notification sent successfully")
    } catch (error) {
        console.error("Error sending notification:", error)
        throw error
    }
}

// already consumed, can delete