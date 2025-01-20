/**
 *
 */

import { Exception } from "@sdkit/meta"
import { useContext } from "react"
import { PWANotificationContext } from "./context"
import type { PWANotificationContextState } from "./types"

export function usePWANotification(): PWANotificationContextState {
    const context = useContext(PWANotificationContext)

    if (!context) {
        throw new Exception({
            in: "framework",
            of: "hook-outside-provider",
            with: {
                internal: {
                    label: "PWANotification Hook Used Outside Provider",
                    message: "`usePWANotification` must be used within a `PWANotificationProvider`."
                }
            }
        })
    }
    return context
}
