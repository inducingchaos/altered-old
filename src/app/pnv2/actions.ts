/**
 *
 */

"use server"

import { sendNotification } from "~/notifications/notificationSender"
import { type PushSubscription } from "web-push"

export async function thePushEndpoint({
    subscription,
    title,
    message
}: {
    subscription: PushSubscriptionJSON
    title: string
    message: string
}): Promise<{ message: string }> {
    await sendNotification(subscription as PushSubscription, title, message)
    return { message: "Push sent." }
}
