/**
 *
 */

"use client"

import type { JSX } from "react"
import { InstallPrompt, PushNotificationManager } from "./components"
import { PWANotificationContextProvider } from "@sdkit/components/context-providers"

export default function PWA(): JSX.Element {
    return (
        <PWANotificationContextProvider>
            <div className="flex flex-col items-center justify-center gap-32px p-32px">
                <PushNotificationManager />
                <InstallPrompt />
            </div>
        </PWANotificationContextProvider>
    )
}
