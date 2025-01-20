/**
 *
 */

import type { Exception } from "@sdkit/meta"

export type PWANotificationContextState = {
    isSupported: boolean
    isGrantedPermission: boolean | undefined
    isSubscribed: boolean
    subscription: PushSubscription | null | undefined
    error: Exception | null
    handleSubscribe: () => Promise<void>
    handleUnsubscribe: () => Promise<void>
}
