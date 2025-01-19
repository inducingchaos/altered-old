/**
 *
 */

"use client"

import type { JSX } from "react"
import { InstallPrompt, PushNotificationManager } from "./components"

export default function PWA(): JSX.Element {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-32px">
            <PushNotificationManager />
            <InstallPrompt />
        </div>
    )
}
