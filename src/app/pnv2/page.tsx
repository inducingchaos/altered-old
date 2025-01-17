"use client"

import { useNotification } from "~/notifications/useNotification"
import { NotificationSubscriptionForm } from "~/app/pnv2/components/a"
import { UnsupportedNotificationMessage } from "~/app/pnv2/components/c"
import NotificationSubscriptionStatus from "~/app/pnv2/components/b"
import { type JSX } from "react"

const Home = (): JSX.Element => {
    const { isSupported, isSubscribed } = useNotification()

    return (
        <div className="flex min-h-[calc(100dvh)] flex-col items-center justify-center bg-gray-100 p-4px">
            {!isSupported ? <UnsupportedNotificationMessage /> : <NotificationSubscriptionStatus />}

            {isSubscribed && <NotificationSubscriptionForm />}
        </div>
    )
}

export default Home
