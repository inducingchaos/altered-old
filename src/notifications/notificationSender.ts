/**
 *
 */

import { sendNotification as _sendNotification, setVapidDetails, type PushSubscription } from "web-push"
import config from "~/config"
setVapidDetails(`mailto:${config.brand.emails.support}`, process.env.NEXT_PUBLIC_VAPID ?? "", process.env.VAPID_SECRET ?? "")

export const sendNotification = async (subscription: PushSubscription, title: string, message: string): Promise<void> => {
    const pushPayload: Record<string, string> = {
        title: title,
        body: message,
        //image: "/logo.png", if you want to add an image
        icon: "/brand/app-icon-512x512.png",
        url: process.env.NOTIFICATION_URL ?? "/",
        badge: "/brand/app-icon-512x512.png"
    }

    _sendNotification(subscription, JSON.stringify(pushPayload))
        .then(() => {
            console.log("Notification sent")
        })
        .catch(error => {
            console.error("Error sending notification", error)
        })
}
