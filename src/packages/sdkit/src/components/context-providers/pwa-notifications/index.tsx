/**
 *
 */

"use client"

import { type Exception } from "@sdkit/meta"
import { useEffect, useState, type JSX, type ReactNode } from "react"
import { PWANotificationContext } from "./context"
import {
    isPermissionGranted,
    isPwaNotificationsSupported,
    pwaNotificationsContextHandleSubscribe,
    pwaNotificationsContextHandleUnsubscribe,
    pwaNotificationsContextRegisterWorker as pwaNotificationsContextRegisterWorker
} from "./utils"

export function PWANotificationContextProvider({ children }: { children: ReactNode }): JSX.Element {
    const [isSupported, setIsSupported] = useState(false)
    const [isGrantedPermission, setIsGrantedPermission] = useState<boolean | undefined>()
    const [subscription, setSubscription] = useState<PushSubscription | null | undefined>()
    const [error, setError] = useState<Exception | null>(null)

    useEffect(() => {
        const _isSupported = isPwaNotificationsSupported()
        setIsSupported(_isSupported)

        const _isGrantedPermission = isPermissionGranted()
        setIsGrantedPermission(_isGrantedPermission)

        if (_isSupported && _isGrantedPermission)
            void pwaNotificationsContextRegisterWorker({
                setters: { setSubscription, setError }
            })
    }, [])

    return (
        <PWANotificationContext.Provider
            value={{
                isSupported,
                isGrantedPermission,
                isSubscribed: !!subscription,
                subscription,
                error,
                handleSubscribe: () =>
                    pwaNotificationsContextHandleSubscribe({
                        setters: { setSubscription, setError }
                    }),
                handleUnsubscribe: () =>
                    pwaNotificationsContextHandleUnsubscribe({
                        subscription,
                        setters: { setSubscription, setError }
                    })
            }}
        >
            {children}
        </PWANotificationContext.Provider>
    )
}

export * from "./use"
