/**
 *
 */

"use client"

import { PWANotificationContextProvider } from "@sdkit/components/context-providers"
import type { JSX } from "react"
import { PushNotificationManager } from "./components"

export default function PWA(): JSX.Element {
    return (
        <PWANotificationContextProvider>
            <div className="flex flex-col items-center justify-center gap-32px p-32px">
                <PushNotificationManager />
            </div>
        </PWANotificationContextProvider>
    )
}
