"use server"

import { setVapidDetails, sendNotification as _sendNotification, type PushSubscription as _PushSubscription } from "web-push"
import config from "~/config"

setVapidDetails(`mailto:${config.brand.emails.support}`, process.env.NEXT_PUBLIC_VAPID!, process.env.VAPID_SECRET!)

let subscription: _PushSubscription | null = null

export async function subscribeUser(sub: _PushSubscription): Promise<{ success: boolean }> {
    subscription = sub
    // In a production environment, you would want to store the subscription in a database
    // For example: await db.subscriptions.create({ data: sub })
    return { success: true }
}

export async function unsubscribeUser(): Promise<{ success: boolean }> {
    subscription = null
    // In a production environment, you would want to remove the subscription from the database
    // For example: await db.subscriptions.delete({ where: { ... } })
    return { success: true }
}

export async function sendNotification(message: string): Promise<{ success: boolean; error?: string }> {
    if (!subscription) {
        throw new Error("No subscription available")
    }

    try {
        await _sendNotification(
            subscription,
            JSON.stringify({
                title: "Reminder",
                body: message,
                icon: "/brand/app-icon-192x192.png"
            })
        )
        return { success: true }
    } catch (error) {
        console.error("Error sending push notification:", error)
        return { success: false, error: "Failed to send notification" }
    }
}
