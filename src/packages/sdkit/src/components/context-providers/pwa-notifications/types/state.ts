/**
 *
 */

import type { Exception } from "@sdkit/meta/exception"
import type { OS } from "../utils/get-os"

export type PWANotificationContextState = {
    isSupported: boolean
    isGrantedPermission: boolean | undefined
    isSubscribed: boolean
    isInstalled: boolean
    os: OS
    subscription: PushSubscription | null | undefined
    error: Exception | null
    handleSubscribe: () => Promise<void>
    handleUnsubscribe: () => Promise<void>
}
